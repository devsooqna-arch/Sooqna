import { Router, type Request, type Response } from "express";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { checkRole } from "../../middleware/checkRole";
import { AppError } from "../../shared/errors/appError";
import { logAuditEvent } from "../audit/audit.service";

type PageParams = {
  limit: number;
  offset: number;
};

const LISTING_STATUSES = ["draft", "pending", "published", "rejected", "sold", "archived"] as const;
const REPORT_STATUSES = ["open", "in_review", "resolved", "rejected"] as const;
const ACCOUNT_STATUSES = ["active", "suspended", "deleted"] as const;

export const adminRouter = Router();

adminRouter.use(verifyFirebaseToken, requireCurrentUser, requireActiveUser, checkRole([Role.ADMIN]));

function pageParams(req: Request, max = 100): PageParams {
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, max));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  return { limit, offset };
}

function stringQuery(req: Request, key: string, max = 200): string | undefined {
  const value = req.query[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function oneOf<T extends readonly string[]>(value: unknown, allowed: T): T[number] | undefined {
  if (typeof value !== "string") return undefined;
  return allowed.includes(value as T[number]) ? (value as T[number]) : undefined;
}

function paginationMeta(total: number, page: PageParams) {
  return {
    total,
    limit: page.limit,
    offset: page.offset,
    hasNextPage: page.offset + page.limit < total,
    hasPreviousPage: page.offset > 0,
  };
}

function actorId(req: Request): string {
  const uid = req.currentUser?.firebaseUid;
  if (!uid) throw new AppError(401, "Unauthorized.", "UNAUTHORIZED");
  return uid;
}

function cleanMetadata(input?: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (/token|secret|password|credential|authorization/i.test(key)) continue;
    output[key] = value;
  }
  return output;
}

adminRouter.get("/stats", async (_req, res) => {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalListings,
    publishedListings,
    draftListings,
    soldListings,
    archivedOrRejectedListings,
    openReports,
    recentAuditActions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { accountStatus: "active" } }),
    prisma.user.count({ where: { accountStatus: "suspended" } }),
    prisma.listing.count({ where: { deletedAt: null } }),
    prisma.listing.count({ where: { deletedAt: null, status: "published" } }),
    prisma.listing.count({ where: { deletedAt: null, status: "draft" } }),
    prisma.listing.count({ where: { deletedAt: null, status: "sold" } }),
    prisma.listing.count({ where: { deletedAt: null, status: { in: ["archived", "rejected"] } } }),
    prisma.report.count({ where: { status: "open" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, actorId: true, action: true, targetType: true, targetId: true, createdAt: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
      listings: {
        total: totalListings,
        published: publishedListings,
        draft: draftListings,
        sold: soldListings,
        archivedOrRejected: archivedOrRejectedListings,
      },
      reports: { open: openReports },
      recentAuditActions: recentAuditActions.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
    },
  });
});

adminRouter.get("/users", async (req, res) => {
  const page = pageParams(req);
  const search = stringQuery(req, "search");
  const role = oneOf(req.query.role, ["ADMIN", "BUYER", "SELLER"] as const);
  const status = oneOf(req.query.status, ACCOUNT_STATUSES);
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(status ? { accountStatus: status } : {}),
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { firebaseUid: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: page.limit,
      skip: page.offset,
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        accountStatus: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({
    success: true,
    data: items.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })),
    pagination: paginationMeta(total, page),
  });
});

adminRouter.patch("/users/:id", async (req, res) => {
  const nextRole = oneOf(req.body?.role, ["ADMIN", "BUYER", "SELLER"] as const);
  const nextStatus = oneOf(req.body?.accountStatus, ACCOUNT_STATUSES);
  if (!nextRole && !nextStatus) {
    throw new AppError(400, "role or accountStatus is required.", "VALIDATION_ERROR");
  }
  const data: Prisma.UserUpdateInput = {
    ...(nextRole ? { role: nextRole } : {}),
    ...(nextStatus ? { accountStatus: nextStatus } : {}),
    updatedAt: new Date(),
  };
  const user = await prisma.user.update({
    where: { firebaseUid: req.params.id },
    data,
    select: {
      id: true,
      firebaseUid: true,
      email: true,
      name: true,
      role: true,
      accountStatus: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  await logAuditEvent({
    actorId: actorId(req),
    action: "admin.user.update",
    targetType: "user",
    targetId: user.firebaseUid,
    metadata: cleanMetadata({ role: nextRole ?? null, accountStatus: nextStatus ?? null }),
  });
  res.json({
    success: true,
    data: { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() },
  });
});

adminRouter.get("/listings", async (req, res) => {
  const page = pageParams(req);
  const status = oneOf(req.query.status, LISTING_STATUSES);
  const category = stringQuery(req, "category", 120);
  const city = stringQuery(req, "city", 120);
  const search = stringQuery(req, "search");
  const featured = req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;
  const where: Prisma.ListingWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(category ? { categoryId: category } : {}),
    ...(city ? { locationCity: { equals: city, mode: "insensitive" } } : {}),
    ...(featured !== undefined ? { isFeatured: featured } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { ownerSnapshotName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: page.limit,
      skip: page.offset,
      select: {
        id: true,
        title: true,
        ownerId: true,
        ownerSnapshotName: true,
        categoryId: true,
        locationCity: true,
        status: true,
        isFeatured: true,
        isApproved: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { listingImages: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);
  res.json({
    success: true,
    data: items.map((listing) => ({
      ...listing,
      imageCount: listing._count.listingImages,
      _count: undefined,
      publishedAt: listing.publishedAt?.toISOString() ?? null,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    })),
    pagination: paginationMeta(total, page),
  });
});

async function moderateListing(req: Request, res: Response, action: "publish" | "reject" | "archive" | "sold" | "feature" | "unfeature") {
  const now = new Date();
  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 1000) : undefined;
  const dataByAction: Record<typeof action, Prisma.ListingUpdateInput> = {
    publish: { status: "published", isApproved: true, publishedAt: now, archivedAt: null, updatedAt: now },
    reject: { status: "rejected", isApproved: false, isFeatured: false, updatedAt: now },
    archive: { status: "archived", isFeatured: false, archivedAt: now, updatedAt: now },
    sold: { status: "sold", isFeatured: false, soldAt: now, updatedAt: now },
    feature: { isFeatured: true, updatedAt: now },
    unfeature: { isFeatured: false, updatedAt: now },
  };
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: dataByAction[action],
    select: {
      id: true,
      title: true,
      ownerId: true,
      status: true,
      isFeatured: true,
      isApproved: true,
      publishedAt: true,
      archivedAt: true,
      soldAt: true,
      updatedAt: true,
    },
  });
  await logAuditEvent({
    actorId: actorId(req),
    action: `admin.listing.${action}`,
    targetType: "listing",
    targetId: listing.id,
    metadata: cleanMetadata({ reason: reason ?? null, status: listing.status, isFeatured: listing.isFeatured }),
  });
  res.json({
    success: true,
    data: {
      ...listing,
      publishedAt: listing.publishedAt?.toISOString() ?? null,
      archivedAt: listing.archivedAt?.toISOString() ?? null,
      soldAt: listing.soldAt?.toISOString() ?? null,
      updatedAt: listing.updatedAt.toISOString(),
    },
  });
}

adminRouter.post("/listings/:id/publish", (req, res) => void moderateListing(req, res, "publish"));
adminRouter.post("/listings/:id/reject", (req, res) => void moderateListing(req, res, "reject"));
adminRouter.post("/listings/:id/archive", (req, res) => void moderateListing(req, res, "archive"));
adminRouter.post("/listings/:id/sold", (req, res) => void moderateListing(req, res, "sold"));
adminRouter.post("/listings/:id/feature", (req, res) => void moderateListing(req, res, "feature"));
adminRouter.post("/listings/:id/unfeature", (req, res) => void moderateListing(req, res, "unfeature"));

adminRouter.get("/reports", async (req, res) => {
  const page = pageParams(req);
  const status = oneOf(req.query.status, REPORT_STATUSES);
  const targetType = oneOf(req.query.targetType, ["listing", "message", "user"] as const);
  const reasonCode = stringQuery(req, "reason", 80);
  const where: Prisma.ReportWhereInput = {
    ...(status ? { status } : {}),
    ...(targetType ? { targetType } : {}),
    ...(reasonCode ? { reasonCode } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.report.findMany({ where, orderBy: { createdAt: "desc" }, take: page.limit, skip: page.offset }),
    prisma.report.count({ where }),
  ]);
  res.json({
    success: true,
    data: items.map((report) => ({
      ...report,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    })),
    pagination: paginationMeta(total, page),
  });
});

adminRouter.patch("/reports/:id", async (req, res) => {
  const status = oneOf(req.body?.status, REPORT_STATUSES);
  if (!status) throw new AppError(400, "Valid status is required.", "VALIDATION_ERROR");
  const note = typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 1000) : null;
  const report = await prisma.report.update({
    where: { id: req.params.id },
    data: { status, moderatorId: actorId(req), moderatorNote: note, updatedAt: new Date() },
  });
  await logAuditEvent({
    actorId: actorId(req),
    action: "admin.report.update",
    targetType: report.targetType,
    targetId: report.targetId,
    metadata: cleanMetadata({ reportId: report.id, status, note }),
  });
  res.json({
    success: true,
    data: { ...report, createdAt: report.createdAt.toISOString(), updatedAt: report.updatedAt.toISOString() },
  });
});

adminRouter.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  res.json({
    success: true,
    data: categories.map((category) => ({
      ...category,
      name: { ar: category.nameAr, en: category.nameEn },
      createdAt: category.createdAt?.toISOString() ?? null,
      updatedAt: category.updatedAt?.toISOString() ?? null,
    })),
  });
});

adminRouter.post("/categories", async (req, res) => {
  const id = String(req.body?.id ?? req.body?.slug ?? "").trim().slice(0, 120);
  const slug = String(req.body?.slug ?? id).trim().slice(0, 120);
  const nameAr = String(req.body?.nameAr ?? req.body?.name?.ar ?? "").trim().slice(0, 120);
  const nameEn = String(req.body?.nameEn ?? req.body?.name?.en ?? "").trim().slice(0, 120);
  if (!id || !slug || !nameAr || !nameEn) {
    throw new AppError(400, "id, slug, nameAr and nameEn are required.", "VALIDATION_ERROR");
  }
  const now = new Date();
  const category = await prisma.category.create({
    data: {
      id,
      slug,
      nameAr,
      nameEn,
      isActive: req.body?.isActive !== false,
      sortOrder: Number.isInteger(req.body?.sortOrder) ? req.body.sortOrder : 0,
      createdAt: now,
      updatedAt: now,
    },
  });
  await logAuditEvent({
    actorId: actorId(req),
    action: "admin.category.create",
    targetType: "category",
    targetId: category.id,
    metadata: cleanMetadata({ slug: category.slug }),
  });
  res.status(201).json({ success: true, data: category });
});

adminRouter.patch("/categories/:id", async (req, res) => {
  const data: Prisma.CategoryUpdateInput = { updatedAt: new Date() };
  if (typeof req.body?.nameAr === "string" || typeof req.body?.name?.ar === "string") {
    data.nameAr = String(req.body?.nameAr ?? req.body.name.ar).trim().slice(0, 120);
  }
  if (typeof req.body?.nameEn === "string" || typeof req.body?.name?.en === "string") {
    data.nameEn = String(req.body?.nameEn ?? req.body.name.en).trim().slice(0, 120);
  }
  if (typeof req.body?.slug === "string") data.slug = req.body.slug.trim().slice(0, 120);
  if (typeof req.body?.isActive === "boolean") data.isActive = req.body.isActive;
  if (Number.isInteger(req.body?.sortOrder)) data.sortOrder = req.body.sortOrder;
  const category = await prisma.category.update({ where: { id: req.params.id }, data });
  await logAuditEvent({
    actorId: actorId(req),
    action: "admin.category.update",
    targetType: "category",
    targetId: category.id,
    metadata: cleanMetadata({ slug: category.slug, isActive: category.isActive }),
  });
  res.json({ success: true, data: category });
});

adminRouter.get("/audit-logs", async (req, res) => {
  const page = pageParams(req, 200);
  const actor = stringQuery(req, "actor", 120);
  const action = stringQuery(req, "action", 120);
  const targetType = stringQuery(req, "targetType", 80);
  const where: Prisma.AuditLogWhereInput = {
    ...(actor ? { actorId: { contains: actor, mode: "insensitive" } } : {}),
    ...(action ? { action: { contains: action, mode: "insensitive" } } : {}),
    ...(targetType ? { targetType } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: page.limit, skip: page.offset }),
    prisma.auditLog.count({ where }),
  ]);
  res.json({
    success: true,
    data: items.map((log) => ({
      ...log,
      metadata: cleanMetadata(log.metadata as Record<string, unknown>),
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: paginationMeta(total, page),
  });
});
