import { apiFetch } from "./apiClient";

export type BackendListing = {
  id: string;
  title: string;
  titleLower: string;
  description: string;
  price: number;
  currency: string;
  priceType: "fixed" | "negotiable" | "contact";
  categoryId: string;
  ownerId: string;
  ownerSnapshot: {
    fullName: string;
    photoURL: string;
  };
  location: {
    country: string;
    city: string;
    area: string;
  };
  images: Array<{
    url: string;
    path: string;
    isPrimary: boolean;
    order: number;
  }>;
  status: "draft" | "pending" | "published" | "rejected" | "sold" | "archived";
  condition: "new" | "used";
  contactPreference: "chat" | "phone";
  contactPhone?: string;
  viewsCount: number;
  favoritesCount: number;
  messagesCount: number;
  isFeatured: boolean;
  isApproved: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function createBackendListing(input: {
  title: string;
  price: number;
  categoryId: string;
  description?: string;
  location?: { country?: string; city?: string; area?: string };
}): Promise<BackendListing> {
  const response = await apiFetch<{ success: boolean; listing: BackendListing }>("/listings", {
    method: "POST",
    body: JSON.stringify(input),
    authenticated: true,
  });
  return response.listing;
}

export async function attachBackendListingImage(
  listingId: string,
  payload: { url: string; path: string; filename?: string }
): Promise<BackendListing> {
  const response = await apiFetch<{ success: boolean; listing: BackendListing }>(
    `/listings/${listingId}/images`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      authenticated: true,
    }
  );
  return response.listing;
}

