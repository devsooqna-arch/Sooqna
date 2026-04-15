import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { seedCategories } from "./seedCategoriesData";

/**
 * Dev utility: reseed categories from UI.
 * Guarded so only users with role=admin can execute.
 */
export const reseedCategories = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const db = getFirestore();
  const userSnap = await db.collection("users").doc(uid).get();
  const role = userSnap.data()?.role;
  if (role !== "admin") {
    throw new HttpsError("permission-denied", "Admin role required.");
  }

  const result = await seedCategories();
  return {
    ok: true,
    ...result,
  };
});

