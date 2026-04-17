import type { Request, Response } from "express";
import { PrismaListingsRepository } from "./repositories/listings.repository";
import { ListingsService } from "./listings.service";

const service = new ListingsService(new PrismaListingsRepository());

export async function createListing(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
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
  } catch (error) {
    res.status(400).json({ success: false, message: String((error as Error).message) });
  }
}

export async function listListings(_req: Request, res: Response): Promise<void> {
  const listings = await service.list();
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
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
    const listing = await service.patch(req.params.id, req.authUser.uid, {
      title: req.body?.title,
      description: req.body?.description,
      price: req.body?.price,
      status: req.body?.status,
    });
    res.json({ success: true, listing });
  } catch (error) {
    const message = (error as Error).message;
    res.status(message === "Forbidden" ? 403 : 400).json({ success: false, message });
  }
}

export async function deleteListing(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
    const listing = await service.softDelete(req.params.id, req.authUser.uid);
    res.json({ success: true, listing });
  } catch (error) {
    const message = (error as Error).message;
    res.status(message === "Forbidden" ? 403 : 400).json({ success: false, message });
  }
}

export async function attachListingImage(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const url = String(req.body?.url ?? "");
  const imagePath = String(req.body?.path ?? "");
  if (!url || !imagePath) {
    res.status(400).json({ success: false, message: "url and path are required." });
    return;
  }

  try {
    const listing = await service.attachImage({
      listingId: req.params.id,
      ownerId: req.authUser.uid,
      url,
      path: imagePath,
    });
    res.json({ success: true, listing });
  } catch (error) {
    const message = (error as Error).message;
    res.status(message === "Forbidden" ? 403 : 400).json({ success: false, message });
  }
}

