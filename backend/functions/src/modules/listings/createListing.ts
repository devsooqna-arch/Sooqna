import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { ensureAdminApp } from "../../config/admin";

ensureAdminApp();

export type CreateListingRequest = {
  title?: unknown;
  price?: unknown;
  categoryId?: unknown;
};

/**
 * Callable: authenticated users only. Creates a draft listing with minimal fields.
 */
export const createListing = onCall<CreateListingRequest>(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const uid = request.auth.uid;
  const { title, price, categoryId } = request.data ?? {};

  if (typeof title !== "string" || !title.trim()) {
    throw new HttpsError("invalid-argument", "Field `title` is required.");
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    throw new HttpsError(
      "invalid-argument",
      "Field `price` must be a non-negative number."
    );
  }
  if (typeof categoryId !== "string" || !categoryId.trim()) {
    throw new HttpsError("invalid-argument", "Field `categoryId` is required.");
  }

  const trimmedTitle = title.trim();
  const db = getFirestore();
  const docRef = db.collection("listings").doc();

  await docRef.set({
    title: trimmedTitle,
    titleLower: trimmedTitle.toLowerCase(),
    price,
    categoryId: categoryId.trim(),
    ownerId: uid,
    status: "draft",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { listingId: docRef.id };
});
