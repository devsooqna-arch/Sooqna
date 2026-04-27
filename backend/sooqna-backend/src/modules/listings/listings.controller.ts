import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { PrismaListingsRepository } from "./repositories/listings.repository";
import { ListingsService } from "./listings.service";

const service = new ListingsService(new PrismaListingsRepository());

export async function createListing(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const listing = await service.create({
    ownerId: req.authUser.uid,
    ownerFullName: req.authUser.name ?? "",
    ownerPhotoURL: req.authUser.picture ?? "",
    title: String(req.body?.title ?? ""),
    price: Number(req.body?.price),
    categoryId: String(req.body?.categoryId ?? ""),
    description: typeof req.body?.description === "string" ? req.body.description : "",
    location: {
      country: String(req.body?.location?.country ?? ""),
      city: String(req.body?.location?.city ?? ""),
      area: String(req.body?.location?.area ?? ""),
    },
  });
  res.status(201).json({ success: true, listing });
}

export async function listListings(req: Request, res: Response): Promise<void> {
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, 100));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const { items, total } = await service.list({ limit, offset });
  res.json({ success: true, listings: items, total, limit, offset });
}

export async function listMyListings(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const listings = await service.listForOwner(req.authUser.uid);
  res.json({ success: true, listings });
}

export async function getListingById(req: Request, res: Response): Promise<void> {
  const listing = await service.getById(req.params.id);
  if (!listing) {
    res.status(404).json({ success: false, message: "Listing not found" });
    return;
  }
  res.json({ success: true, listing });
}

export async function patchListing(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const listing = await service.patch(req.params.id, req.authUser.uid, {
    title: req.body?.title,
    description: req.body?.description,
    price: req.body?.price,
    status: req.body?.status,
  });
  res.json({ success: true, listing });
}

export async function deleteListing(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const listing = await service.softDelete(req.params.id, req.authUser.uid);
  res.json({ success: true, listing });
}

export async function attachListingImage(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const url = String(req.body?.url ?? "");
  const imagePath = String(req.body?.path ?? "");
  if (!url || !imagePath) {
    throw new AppError(400, "url and path are required.", "VALIDATION_ERROR");
  }

  const listing = await service.attachImage({
    listingId: req.params.id,
    ownerId: req.authUser.uid,
    url,
    path: imagePath,
  });
  res.json({ success: true, listing });
}

