import { prisma } from "../../../config/prisma";
import type { Review, PublicReview } from "../reviews.types";

export interface ReviewsRepository {
  create(review: Review): Promise<Review>;
  findByReviewerAndListing(reviewerId: string, listingId: string): Promise<Review | null>;
  listBySeller(sellerId: string, limit: number, offset: number): Promise<{ items: PublicReview[]; total: number }>;
  listByListing(listingId: string, limit: number): Promise<PublicReview[]>;
}

export class PrismaReviewsRepository implements ReviewsRepository {
  async create(review: Review): Promise<Review> {
    const created = await prisma.review.create({
      data: {
        id: review.id,
        sellerId: review.sellerId,
        reviewerId: review.reviewerId,
        listingId: review.listingId,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.createdAt),
        updatedAt: new Date(review.updatedAt),
      },
    });
    return {
      id: created.id,
      sellerId: created.sellerId,
      reviewerId: created.reviewerId,
      listingId: created.listingId,
      rating: created.rating,
      comment: created.comment,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async findByReviewerAndListing(reviewerId: string, listingId: string): Promise<Review | null> {
    const review = await prisma.review.findFirst({
      where: { reviewerId, listingId },
    });
    if (!review) return null;
    return {
      id: review.id,
      sellerId: review.sellerId,
      reviewerId: review.reviewerId,
      listingId: review.listingId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  async listBySeller(
    sellerId: string,
    limit: number,
    offset: number
  ): Promise<{ items: PublicReview[]; total: number }> {
    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: { sellerId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          reviewer: { select: { name: true, avatarUrl: true } },
        },
      }),
      prisma.review.count({ where: { sellerId } }),
    ]);
    return {
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reviewer: {
          fullName: r.reviewer.name,
          photoURL: r.reviewer.avatarUrl ?? "",
        },
        listingId: r.listingId,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
    };
  }

  async listByListing(listingId: string, limit: number): Promise<PublicReview[]> {
    const reviews = await prisma.review.findMany({
      where: { listingId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        reviewer: { select: { name: true, avatarUrl: true } },
      },
    });
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      reviewer: {
        fullName: r.reviewer.name,
        photoURL: r.reviewer.avatarUrl ?? "",
      },
      listingId: r.listingId,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
