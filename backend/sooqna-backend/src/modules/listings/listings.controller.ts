import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { logAuditEvent } from "../audit/audit.service";
import { PrismaReviewsRepository } from "../reviews/repositories/reviews.repository";
import { ReviewsService } from "../reviews/reviews.service";
import { PrismaUploadsRepository } from "../uploads/uploads.repository";
import { PrismaListingsRepository } from "./repositories/listings.repository";
import { ListingsService } from "./listings.service";
import type { ListingCurrency } from "./listings.types";
import { toPublicListing } from "./listings.types";

const service = new ListingsService(new PrismaListingsRepository());
const reviewsService = new ReviewsService(new PrismaReviewsRepository());
const uploadsRepository = new PrismaUploadsRepository();

function requireTrustedUid(req: Request): string {
  const uid = req.currentUser?.firebaseUid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  return uid;
}

export async function createListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listing = await service.create({
    ownerId: uid,
    ownerFullName: req.currentUser?.displayName ?? "",
    ownerPhotoURL: req.currentUser?.photoURL ?? "",
    title: String(req.body?.title ?? ""),
    price: Number(req.body?.price),
    currency: req.body?.currency as ListingCurrency | undefined,
    categoryId: String(req.body?.categoryId ?? ""),
    description: typeof req.body?.description === "string" ? req.body.description : "",
    clientRequestId:
      typeof req.body?.clientRequestId === "string" ? req.body.clientRequestId : undefined,
    location: {
      country: String(req.body?.location?.country ?? ""),
      city: String(req.body?.location?.city ?? ""),
      area: String(req.body?.location?.area ?? ""),
    },
  });
  await logAuditEvent({
    actorId: uid,
    action: "listing.create",
    targetType: "listing",
    targetId: listing.id,
  });
  res.status(201).json({ success: true, listing });
}

export async function listListings(req: Request, res: Response): Promise<void> {
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, 100));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const category =
    typeof req.query.category === "string" && req.query.category.trim()
      ? req.query.category.trim()
      : undefined;
  const city =
    typeof req.query.city === "string" && req.query.city.trim() ? req.query.city.trim() : undefined;
  const search =
    typeof req.query.search === "string" && req.query.search.trim()
      ? req.query.search.trim()
      : undefined;
  const sortRaw = typeof req.query.sort === "string" ? req.query.sort : undefined;
  const sort =
    sortRaw === "price_asc" || sortRaw === "price_desc" || sortRaw === "newest"
      ? sortRaw
      : undefined;

  const priceMinRaw = Number(req.query.priceMin);
  const priceMaxRaw = Number(req.query.priceMax);
  const priceMin = Number.isFinite(priceMinRaw) && priceMinRaw >= 0 ? priceMinRaw : undefined;
  const priceMax = Number.isFinite(priceMaxRaw) && priceMaxRaw >= 0 ? priceMaxRaw : undefined;

  const normalizedFilters = service.normalizeFilters({ limit, offset, category, city, search, sort, priceMin, priceMax });
  const { items, total } = await service.list(normalizedFilters);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  res.json({
    success: true,
    listings: items.map(toPublicListing),
    total,
    limit,
    offset,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    filters: {
      category: normalizedFilters.category ?? null,
      city: normalizedFilters.city ?? null,
      search: normalizedFilters.search ?? null,
      sort: normalizedFilters.sort ?? "newest",
      priceMin: normalizedFilters.priceMin ?? null,
      priceMax: normalizedFilters.priceMax ?? null,
    },
  });
}

export async function listMyListings(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listings = await service.listForOwner(uid);
  res.json({ success: true, listings });
}

export async function getListingById(req: Request, res: Response): Promise<void> {
  const viewerId = req.authUser?.uid;
  const listing = await service.recordView(req.params.id, viewerId);
  if (!listing) {
    res.status(404).json({ success: false, message: "Listing not found" });
    return;
  }

  let sellerProfile = null;
  let recentReviews: unknown[] = [];
  if (listing.ownerId) {
    try {
      const [profile, reviews] = await Promise.all([
        reviewsService.getPublicSellerProfile(listing.ownerId),
        reviewsService.getListingReviews(listing.id, 3),
      ]);
      sellerProfile = profile;
      recentReviews = reviews;
    } catch {
      // Seller data is supplementary — don't fail the listing response
    }
  }

  res.json({ success: true, listing, seller: sellerProfile, reviews: recentReviews });
}

export async function patchListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listing = await service.patch(req.params.id, uid, {
    title: req.body?.title,
    description: req.body?.description,
    price: req.body?.price,
  });
  await logAuditEvent({
    actorId: uid,
    action: "listing.update",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function publishListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listing = await service.publish(req.params.id, uid);
  await logAuditEvent({
    actorId: uid,
    action: "listing.publish",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function unpublishListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listing = await service.unpublish(req.params.id, uid);
  await logAuditEvent({
    actorId: uid,
    action: "listing.unpublish",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function archiveListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listing = await service.archive(req.params.id, uid);
  await logAuditEvent({
    actorId: uid,
    action: "listing.archive",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function markListingSold(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listing = await service.markSold(req.params.id, uid);
  await logAuditEvent({
    actorId: uid,
    action: "listing.sold",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function renewListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const durationDays =
    typeof req.body?.durationDays === "number" && Number.isInteger(req.body.durationDays)
      ? req.body.durationDays
      : undefined;
  const listing = await service.renew(req.params.id, uid, durationDays);
  await logAuditEvent({
    actorId: uid,
    action: "listing.renew",
    targetType: "listing",
    targetId: listing.id,
    metadata: { durationDays: durationDays ?? null },
  });
  res.json({ success: true, listing });
}

export async function expireListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listing = await service.expire(req.params.id, uid);
  await logAuditEvent({
    actorId: uid,
    action: "listing.expire",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function deleteListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const listing = await service.softDelete(req.params.id, uid);
  await logAuditEvent({
    actorId: uid,
    action: "listing.delete",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function featureListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const role = req.currentUser?.role ?? "BUYER";
  const listing = await service.feature(req.params.id, uid, role);
  await logAuditEvent({
    actorId: uid,
    action: "listing.feature",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function unfeatureListing(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);
  const role = req.currentUser?.role ?? "BUYER";
  const listing = await service.unfeature(req.params.id, uid, role);
  await logAuditEvent({
    actorId: uid,
    action: "listing.unfeature",
    targetType: "listing",
    targetId: listing.id,
  });
  res.json({ success: true, listing });
}

export async function getListingsByIds(req: Request, res: Response): Promise<void> {
  const ids: string[] = req.body?.ids ?? [];
  const listings = await service.findPublicByIds(ids);
  res.json({ success: true, listings: listings.map(toPublicListing) });
}

export async function attachListingImage(req: Request, res: Response): Promise<void> {
  const uid = requireTrustedUid(req);

  const url = String(req.body?.url ?? "");
  const imagePath = String(req.body?.path ?? "");
  if (!url || !imagePath) {
    throw new AppError(400, "url and path are required.", "VALIDATION_ERROR");
  }

  const listing = await service.attachImage({
    listingId: req.params.id,
    ownerId: uid,
    url,
    path: imagePath,
  });
  await uploadsRepository.markAttachedToListing(imagePath, listing.id);
  res.json({ success: true, listing });
}
