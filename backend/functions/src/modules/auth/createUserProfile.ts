import * as functions from "firebase-functions/v1";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, ensureAdminApp } from "../../config/admin";

ensureAdminApp();

/**
 * When a new Firebase Auth user is created, mirror a profile document in Firestore.
 * Server-side source of truth complements the client `subscribeEnsureUserProfile` guard.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const ref = adminDb.collection("users").doc(user.uid);

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

/**
 * Backward-compatible export name used by current project modules.
 */
export const createUserProfile = onUserCreated;
