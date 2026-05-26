import { apiFetch } from "@/services/apiClient";
import type { PublicReview, PublicSellerProfile } from "@/types/review";

export async function createReview(input: {
  sellerId: string;
  listingId: string;
  rating: number;
  comment: string;
}): Promise<PublicReview> {
  const response = await apiFetch<{ success: true; review: PublicReview }>("/reviews", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(input),
  });
  return response.review;
}

export async function getSellerReviews(
  sellerId: string,
  limit = 20,
  offset = 0
): Promise<{ reviews: PublicReview[]; total: number }> {
  const response = await apiFetch<{ success: true; reviews: PublicReview[]; total: number }>(
    `/reviews/seller/${sellerId}?limit=${limit}&offset=${offset}`
  );
  return { reviews: response.reviews, total: response.total };
}

export async function getSellerProfile(sellerId: string): Promise<PublicSellerProfile> {
  const response = await apiFetch<{ success: true; seller: PublicSellerProfile }>(
    `/reviews/seller/${sellerId}/profile`
  );
  return response.seller;
}

export async function getListingReviews(listingId: string): Promise<PublicReview[]> {
  const response = await apiFetch<{ success: true; reviews: PublicReview[] }>(
    `/reviews/listing/${listingId}`
  );
  return response.reviews;
}
