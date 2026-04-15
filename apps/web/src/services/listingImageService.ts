import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Listing, ListingImage } from "@/types/listing";
import { mapFirestoreListing } from "@/services/listingService";

export type AddImageToListingInput = {
  url: string;
  path: string;
};

function normalizeExistingImages(images: unknown): ListingImage[] {
  if (!Array.isArray(images)) {
    return [];
  }
  return images.map((img: any, idx: number) => ({
    url: String(img?.url ?? ""),
    path: String(img?.path ?? ""),
    isPrimary: Boolean(img?.isPrimary),
    order: Number(img?.order ?? idx + 1),
  }));
}

/**
 * Adds image metadata to listing.images while keeping deterministic order/primary image.
 */
export async function addImageToListing(
  listingId: string,
  imageData: AddImageToListingInput
): Promise<ListingImage[]> {
  if (!listingId.trim()) {
    throw new Error("listingId is required.");
  }
  if (!imageData.url.trim() || !imageData.path.trim()) {
    throw new Error("imageData.url and imageData.path are required.");
  }

  const ref = doc(db, "listings", listingId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Listing not found.");
  }

  const listing = mapFirestoreListing(
    snap as QueryDocumentSnapshot<DocumentData>
  );
  const existing = normalizeExistingImages(listing.images);

  const newImage: ListingImage = {
    url: imageData.url,
    path: imageData.path,
    isPrimary: existing.length === 0,
    order: existing.length + 1,
  };

  const nextImages = [...existing, newImage].map((img, idx) => ({
    ...img,
    order: idx + 1,
    isPrimary: idx === 0,
  }));

  await updateDoc(ref, {
    images: nextImages,
    updatedAt: serverTimestamp(),
  });

  return nextImages;
}

