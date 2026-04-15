import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, db } from "@/lib/firebase";
import type { CreateListingInput, CreateListingResult, Listing } from "@/types/listing";

const listingsRef = collection(db, "listings");
const functions = getFunctions(app);

/**
 * Small mapper helper for Firestore doc -> Listing.
 */
export function mapFirestoreListing(
  snapshot: QueryDocumentSnapshot<DocumentData>
): Listing {
  const data = snapshot.data() as Omit<Listing, "id"> & Record<string, unknown>;
  return {
    id: snapshot.id,
    title: String(data.title ?? ""),
    titleLower: String(data.titleLower ?? ""),
    description: String(data.description ?? ""),
    price: Number(data.price ?? 0),
    currency: String(data.currency ?? "JOD"),
    priceType: (data.priceType as Listing["priceType"]) ?? "fixed",
    categoryId: String(data.categoryId ?? ""),
    ownerId: String(data.ownerId ?? ""),
    ownerSnapshot: {
      fullName: String(data.ownerSnapshot?.fullName ?? ""),
      photoURL: String(data.ownerSnapshot?.photoURL ?? ""),
    },
    location: {
      country: String(data.location?.country ?? ""),
      city: String(data.location?.city ?? ""),
      area: String(data.location?.area ?? ""),
    },
    images: Array.isArray(data.images)
      ? data.images.map((img: any, idx: number) => ({
          url: String(img?.url ?? ""),
          path: String(img?.path ?? ""),
          isPrimary: Boolean(img?.isPrimary),
          order: Number(img?.order ?? idx + 1),
        }))
      : [],
    status: (data.status as Listing["status"]) ?? "draft",
    condition: (data.condition as Listing["condition"]) ?? "used",
    contactPreference: (data.contactPreference as Listing["contactPreference"]) ?? "chat",
    viewsCount: Number(data.viewsCount ?? 0),
    favoritesCount: Number(data.favoritesCount ?? 0),
    messagesCount: Number(data.messagesCount ?? 0),
    isFeatured: Boolean(data.isFeatured),
    isApproved: Boolean(data.isApproved),
    publishedAt: (data.publishedAt as Listing["publishedAt"]) ?? null,
    expiresAt: (data.expiresAt as Listing["expiresAt"]) ?? null,
    createdAt: (data.createdAt as Listing["createdAt"]) ?? null,
    updatedAt: (data.updatedAt as Listing["updatedAt"]) ?? null,
    deletedAt: (data.deletedAt as Listing["deletedAt"]) ?? null,
  };
}

/**
 * Create listing through existing callable cloud function.
 */
export async function createListing(
  input: CreateListingInput
): Promise<CreateListingResult> {
  const callable = httpsCallable<CreateListingInput, CreateListingResult>(
    functions,
    "createListing"
  );
  const result = await callable({
    title: input.title,
    price: input.price,
    categoryId: input.categoryId,
  });
  return result.data;
}

/**
 * Fetch published, non-deleted listings ordered by newest first.
 */
export async function getListings(): Promise<Listing[]> {
  const q = query(
    listingsRef,
    where("status", "==", "published"),
    where("deletedAt", "==", null),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapFirestoreListing);
}

/**
 * Fetch a single listing by id.
 */
export async function getListingById(id: string): Promise<Listing | null> {
  const ref = doc(db, "listings", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  return mapFirestoreListing(snap as QueryDocumentSnapshot<DocumentData>);
}

