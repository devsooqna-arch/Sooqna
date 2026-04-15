import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Favorite } from "@/types/favorite";

function favoriteDocRef(userId: string, listingId: string) {
  return doc(db, "users", userId, "favorites", listingId);
}

function favoritesCollectionRef(userId: string) {
  return collection(db, "users", userId, "favorites");
}

function mapFavorite(snapshot: QueryDocumentSnapshot<DocumentData>): Favorite {
  const data = snapshot.data() as Omit<Favorite, "listingId"> & Record<string, unknown>;
  return {
    listingId: String(data.listingId ?? snapshot.id),
    createdAt: (data.createdAt as Favorite["createdAt"]) ?? null,
  };
}

/**
 * Create or overwrite favorite:
 * users/{userId}/favorites/{listingId}
 *
 * Note: listing favoritesCount can be incremented here in a later milestone
 * (preferably via transaction or callable function to keep counters consistent).
 */
export async function addToFavorites(userId: string, listingId: string): Promise<void> {
  await setDoc(favoriteDocRef(userId, listingId), {
    listingId,
    createdAt: serverTimestamp(),
  });
}

/**
 * Remove favorite doc:
 * users/{userId}/favorites/{listingId}
 *
 * Note: listing favoritesCount decrement can be added later with safe counter logic.
 */
export async function removeFromFavorites(userId: string, listingId: string): Promise<void> {
  await deleteDoc(favoriteDocRef(userId, listingId));
}

/**
 * Check if listing is favorited by this user.
 */
export async function isFavorite(userId: string, listingId: string): Promise<boolean> {
  const snap = await getDoc(favoriteDocRef(userId, listingId));
  return snap.exists();
}

/**
 * Fetch user favorites newest first.
 */
export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  const q = query(favoritesCollectionRef(userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapFavorite);
}

/**
 * Lightweight helper for quick UI checks.
 */
export async function getUserFavoriteListingIds(userId: string): Promise<string[]> {
  const favorites = await getUserFavorites(userId);
  return favorites.map((favorite) => favorite.listingId);
}

