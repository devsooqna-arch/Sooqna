export interface Favorite {
  listingId: string;
  createdAt: string | null;
}

/**
 * Optional helper for screens that enrich a favorite with listing data.
 * Keep foundation lightweight; listing fields can be attached later.
 */
export interface FavoriteListingItem {
  favorite: Favorite;
}

