import { apiFetch } from "@/services/apiClient";
import type { CreateListingInput, CreateListingResult, Listing } from "@/types/listing";

/**
 * Create listing through existing callable cloud function.
 */
export async function createListing(
  input: CreateListingInput
): Promise<CreateListingResult> {
  const response = await apiFetch<{ success: true; listing: Listing }>("/listings", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify({
      title: input.title,
      price: input.price,
      categoryId: input.categoryId,
    }),
  });
  return {
    success: true,
    listingId: response.listing.id,
  };
}

/**
 * Fetch non-deleted listings.
 */
export async function getListings(): Promise<Listing[]> {
  const response = await apiFetch<{ success: true; listings: Listing[] }>("/listings");
  return response.listings;
}

/**
 * Fetch a single listing by id.
 */
export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const response = await apiFetch<{ success: true; listing: Listing }>(`/listings/${id}`);
    return response.listing;
  } catch {
    return null;
  }
}

export async function updateListing(
  listingId: string,
  patch: Partial<Pick<Listing, "title" | "description" | "price" | "status">>
): Promise<Listing> {
  const response = await apiFetch<{ success: true; listing: Listing }>(`/listings/${listingId}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(patch),
  });
  return response.listing;
}

export async function deleteListing(listingId: string): Promise<Listing> {
  const response = await apiFetch<{ success: true; listing: Listing }>(`/listings/${listingId}`, {
    method: "DELETE",
    authenticated: true,
  });
  return response.listing;
}

export async function attachListingImage(
  listingId: string,
  image: { url: string; path: string }
): Promise<Listing> {
  const response = await apiFetch<{ success: true; listing: Listing }>(
    `/listings/${listingId}/images`,
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(image),
    }
  );
  return response.listing;
}

