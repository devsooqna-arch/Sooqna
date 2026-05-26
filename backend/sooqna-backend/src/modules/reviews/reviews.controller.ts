import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { logAuditEvent } from "../audit/audit.service";
import { PrismaReviewsRepository } from "./repositories/reviews.repository";
import { ReviewsService } from "./reviews.service";

const service = new ReviewsService(new PrismaReviewsRepository());

function requireUid(req: Request): string {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  return uid;
}

export async function createReview(req: Request, res: Response): Promise<void> {
  const reviewerId = requireUid(req);
  const { sellerId, listingId, rating, comment } = req.body;

  const review = await service.createReview({
    sellerId: String(sellerId),
    reviewerId,
    listingId: String(listingId),
    rating: Number(rating),
    comment: String(comment ?? ""),
  });

  await logAuditEvent({
    actorId: reviewerId,
    action: "review.create",
    targetType: "review",
    targetId: review.id,
    metadata: { sellerId, listingId, rating },
  });

  res.status(201).json({ success: true, review });
}

export async function getSellerReviews(req: Request, res: Response): Promise<void> {
  const sellerId = req.params.sellerId;
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, 50));
  const offset = Math.max(0, Number(req.query.offset) || 0);

  const result = await service.getSellerReviews(sellerId, limit, offset);
  res.json({ success: true, reviews: result.items, total: result.total });
}

export async function getSellerProfile(req: Request, res: Response): Promise<void> {
  const sellerId = req.params.sellerId;
  const profile = await service.getPublicSellerProfile(sellerId);
  res.json({ success: true, seller: profile });
}

export async function getListingReviews(req: Request, res: Response): Promise<void> {
  const listingId = req.params.listingId;
  const reviews = await service.getListingReviews(listingId);
  res.json({ success: true, reviews });
}
