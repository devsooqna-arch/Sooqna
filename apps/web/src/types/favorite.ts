import type { Timestamp } from "firebase/firestore";

export interface Favorite {
  listingId: string;
  createdAt: Timestamp | null;
}

/**
 * Optional helper for screens that enrich a favorite with listing data.
 * Keep foundation lightweight; listing fields can be attached later.
 */
export interface FavoriteListingItem {
  favorite: Favorite;
}

