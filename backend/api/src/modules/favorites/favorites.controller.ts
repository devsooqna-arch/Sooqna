import type { Request, Response } from "express";
import { FileFavoritesRepository } from "./repositories/favorites.repository";
import { FavoritesService } from "./favorites.service";

const service = new FavoritesService(new FileFavoritesRepository());

export async function addFavorite(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  await service.add(uid, req.params.listingId);
  res.json({ success: true });
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  await service.remove(uid, req.params.listingId);
  res.json({ success: true });
}

export async function listFavorites(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  const listingIds = await service.list(uid);
  res.json({ success: true, listingIds });
}

