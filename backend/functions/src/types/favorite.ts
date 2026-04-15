import type { FirestoreDate } from "./firestore";

/**
 * `users/{userId}/favorites/{listingId}` — document id = listing id.
 */
export interface Favorite {
  listingId: string;
  createdAt: FirestoreDate;
}
