import { apiClient } from "./apiClient";

export async function getFavorites(): Promise<string[]> {
  const response = await apiClient<{ success: true; listingIds: string[] }>("/favorites", {
    method: "GET",
    authenticated: true,
  });
  return response.listingIds;
}

