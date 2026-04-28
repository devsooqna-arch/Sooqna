import { apiFetch } from "@/services/apiClient";
import type { Favorite } from "@/types/favorite";
import { trackEngagementEvent } from "@/services/engagementService";

/**
 * Create or overwrite favorite:
 * users/{userId}/favorites/{listingId}
 *
 * Note: listing favoritesCount can be incremented here in a later milestone
 * (preferably via transaction or callable function to keep counters consistent).
 */
export async function addToFavorites(userId: string, listingId: string): Promise<void> {
  void userId;
  await apiFetch<{ success: true }>(`/favorites/${listingId}`, {
    method: "POST",
    authenticated: true,
  });
  void trackEngagementEvent("favorite", { listingId, metadata: { action: "add" } });
}

/**
 * Remove favorite doc:
 * users/{userId}/favorites/{listingId}
 *
 * Note: listing favoritesCount decrement can be added later with safe counter logic.
 */
export async function removeFromFavorites(userId: string, listingId: string): Promise<void> {
  void userId;
  await apiFetch<{ success: true }>(`/favorites/${listingId}`, {
    method: "DELETE",
    authenticated: true,
  });
  void trackEngagementEvent("favorite", { listingId, metadata: { action: "remove" } });
}

/**
 * Check if listing is favorited by this user.
 */
export async function isFavorite(userId: string, listingId: string): Promise<boolean> {
  const ids = await getUserFavoriteListingIds(userId);
  return ids.includes(listingId);
}

/**
 * Fetch user favorites newest first.
 */
export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  void userId;
  const response = await apiFetch<{ success: true; listingIds: string[] }>("/favorites", {
    authenticated: true,
  });
  return response.listingIds.map((listingId) => ({
    listingId,
    createdAt: null,
  }));
}

/**
 * Lightweight helper for quick UI checks.
 */
export async function getUserFavoriteListingIds(userId: string): Promise<string[]> {
  const favorites = await getUserFavorites(userId);
  return favorites.map((favorite) => favorite.listingId);
}

