import { apiFetch } from "@/services/apiClient";
import type { CreateListingInput, CreateListingResult, Listing } from "@/types/listing";

/**
 * Create listing through existing callable cloud function.
 */
export async function createListing(
  input: CreateListingInput
): Promise<CreateListingResult> {
  const location = {
    country: input.location?.country?.trim() || "Syria",
    city: input.location?.city?.trim() || "Aleppo",
    area: input.location?.area?.trim() || "Unknown",
  };
  const response = await apiFetch<{ success: true; listing: Listing }>("/listings", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify({
      title: input.title,
      price: input.price,
      categoryId: input.categoryId,
      description: input.description ?? "",
      location,
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

export type ListingsFilterParams = {
  limit?: number;
  offset?: number;
  category?: string;
  city?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function getListingsFiltered(params: ListingsFilterParams): Promise<{
  listings: Listing[];
  total: number;
  limit: number;
  offset: number;
  filters?: {
    category: string | null;
    city: string | null;
    search: string | null;
    sort: "newest" | "price_asc" | "price_desc";
  };
}> {
  const query = new URLSearchParams();
  if (typeof params.limit === "number") query.set("limit", String(params.limit));
  if (typeof params.offset === "number") query.set("offset", String(params.offset));
  if (params.category?.trim()) query.set("category", params.category.trim());
  if (params.city?.trim()) query.set("city", params.city.trim());
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sort) query.set("sort", params.sort);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<{
    success: true;
    listings: Listing[];
    total: number;
    limit: number;
    offset: number;
    filters?: {
      category: string | null;
      city: string | null;
      search: string | null;
      sort: "newest" | "price_asc" | "price_desc";
    };
  }>(
    `/listings${suffix}`
  );
}

export async function getMyListings(): Promise<Listing[]> {
  const response = await apiFetch<{ success: true; listings: Listing[] }>("/listings/mine", {
    authenticated: true,
  });
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
  patch: Partial<Pick<Listing, "title" | "description" | "price">>
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

export async function publishListing(listingId: string): Promise<Listing> {
  const response = await apiFetch<{ success: true; listing: Listing }>(`/listings/${listingId}/publish`, {
    method: "POST",
    authenticated: true,
  });
  return response.listing;
}

export async function unpublishListing(listingId: string): Promise<Listing> {
  const response = await apiFetch<{ success: true; listing: Listing }>(
    `/listings/${listingId}/unpublish`,
    {
      method: "POST",
      authenticated: true,
    }
  );
  return response.listing;
}

export async function renewListing(listingId: string, durationDays?: number): Promise<Listing> {
  const response = await apiFetch<{ success: true; listing: Listing }>(`/listings/${listingId}/renew`, {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(durationDays ? { durationDays } : {}),
  });
  return response.listing;
}

export async function expireListing(listingId: string): Promise<Listing> {
  const response = await apiFetch<{ success: true; listing: Listing }>(`/listings/${listingId}/expire`, {
    method: "POST",
    authenticated: true,
  });
  return response.listing;
}

export async function attachListingImage(
  listingId: string,
  image: { url: string; path: string }
): Promise<Listing> {
  /** Backend `attachListingImageBodySchema` is `.strict()` — only url + path. */
  const payload = { url: image.url, path: image.path };
  const response = await apiFetch<{ success: true; listing: Listing }>(
    `/listings/${listingId}/images`,
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(payload),
    }
  );
  return response.listing;
}

