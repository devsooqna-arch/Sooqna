import * as functions from "firebase-functions/v1";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { ensureAdminApp } from "../../config/admin";

ensureAdminApp();

/**
 * When a new Firebase Auth user is created, mirror a profile document in Firestore.
 * Server-side source of truth complements the client `subscribeEnsureUserProfile` guard.
 */
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  const db = getFirestore();
  const ref = db.collection("users").doc(user.uid);

  await ref.set(
    {
      uid: user.uid,
      email: user.email ?? "",
      fullName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      role: "user",
      accountStatus: "active",
      isEmailVerified: user.emailVerified ?? false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
});
