import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { logAuditEvent } from "../audit/audit.service";
import { PrismaFavoritesRepository } from "./repositories/favorites.repository";
import { FavoritesService } from "./favorites.service";

const service = new FavoritesService(new PrismaFavoritesRepository());

export async function addFavorite(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const result = await service.add(uid, req.params.listingId);
  await logAuditEvent({
    actorId: uid,
    action: "favorite.add",
    targetType: "listing",
    targetId: req.params.listingId,
  });
  res.json({ success: true, ...result });
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const result = await service.remove(uid, req.params.listingId);
  await logAuditEvent({
    actorId: uid,
    action: "favorite.remove",
    targetType: "listing",
    targetId: req.params.listingId,
  });
  res.json({ success: true, ...result });
}

export async function listFavorites(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const listingIds = await service.list(uid);
  res.json({ success: true, listingIds });
}

