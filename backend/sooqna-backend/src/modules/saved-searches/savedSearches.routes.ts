import { Router } from "express";
import type { Request } from "express";
import { prisma } from "../../config/prisma";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { AppError } from "../../shared/errors/appError";

const ALLOWED_QUERY_KEYS = new Set(["q", "category", "city", "minPrice", "maxPrice", "priceMin", "priceMax", "condition", "sort"]);

export const savedSearchesRouter = Router();

savedSearchesRouter.use(verifyFirebaseToken, requireCurrentUser, requireActiveUser);

savedSearchesRouter.get("/", async (req, res) => {
  const userId = requireUid(req);
  const items = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json({
    success: true,
    data: items.map(serializeSavedSearch),
  });
});

savedSearchesRouter.post("/", async (req, res) => {
  const userId = requireUid(req);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name || name.length > 80) {
    throw new AppError(400, "Saved search name must be between 1 and 80 characters.", "VALIDATION_ERROR");
  }
  const query = cleanSavedSearchQuery(req.body?.query);
  if (!Object.keys(query).length) {
    throw new AppError(400, "Saved search query must include at least one filter.", "VALIDATION_ERROR");
  }

  const item = await prisma.savedSearch.create({
    data: {
      userId,
      name,
      query,
    },
  });

  res.status(201).json({ success: true, data: serializeSavedSearch(item) });
});

savedSearchesRouter.delete("/:id", async (req, res) => {
  const userId = requireUid(req);
  const existing = await prisma.savedSearch.findFirst({
    where: { id: req.params.id, userId },
  });
  if (!existing) {
    throw new AppError(404, "Saved search not found.", "NOT_FOUND");
  }

  await prisma.savedSearch.delete({ where: { id: existing.id } });
  res.json({ success: true, data: { id: existing.id, deleted: true } });
});

function requireUid(req: Request): string {
  const uid = req.currentUser?.firebaseUid;
  if (!uid) throw new AppError(401, "Unauthorized.", "UNAUTHORIZED");
  return uid;
}

function cleanSavedSearchQuery(value: unknown): Record<string, string | number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(400, "Saved search query must be an object.", "VALIDATION_ERROR");
  }

  const output: Record<string, string | number> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!ALLOWED_QUERY_KEYS.has(key)) continue;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed) output[key] = trimmed.slice(0, 120);
    } else if (typeof raw === "number" && Number.isFinite(raw)) {
      output[key] = raw;
    }
  }
  return output;
}

function serializeSavedSearch(item: {
  id: string;
  name: string;
  query: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: item.id,
    name: item.name,
    query: item.query,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
