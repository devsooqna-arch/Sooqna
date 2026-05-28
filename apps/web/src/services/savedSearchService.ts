import { apiFetch } from "@/services/apiClient";
import type { SavedSearch, SavedSearchQuery } from "@/types/savedSearch";

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const response = await apiFetch<{ success: true; data: SavedSearch[] }>("/saved-searches", {
    authenticated: true,
  });
  return response.data;
}

export async function createSavedSearch(name: string, query: SavedSearchQuery): Promise<SavedSearch> {
  const response = await apiFetch<{ success: true; data: SavedSearch }>("/saved-searches", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify({ name, query }),
  });
  return response.data;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await apiFetch<{ success: true; data: { id: string; deleted: true } }>(`/saved-searches/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}
