import { apiClient } from "./apiClient";
import type { Listing } from "@/types/listing";

export async function createListing(input: {
  title: string;
  price: number;
  categoryId: string;
  description?: string;
}): Promise<Listing> {
  const response = await apiClient<{ success: true; listing: Listing }>("/listings", {
    method: "POST",
    body: JSON.stringify(input),
    authenticated: true,
  });
  return response.listing;
}

