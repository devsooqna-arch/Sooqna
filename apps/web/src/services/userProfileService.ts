import { type User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Creates or merges `users/{uid}` so the Firestore profile stays aligned with Auth
 * (used after signup, login, and Google sign-in).
 */
export async function ensureUserProfile(
  user: User,
  options?: { fullName?: string }
): Promise<{ created: boolean }> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const existing = snap.exists()
    ? (snap.data() as Record<string, unknown>)
    : {};

  const fullName =
    (options?.fullName?.trim() ||
      user.displayName?.trim() ||
      (typeof existing.fullName === "string" ? existing.fullName : "") ||
      "") as string;

  const payload = {
    uid: user.uid,
    fullName,
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    role: "user" as const,
    accountStatus: "active" as const,
    isEmailVerified: user.emailVerified,
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...payload,
      createdAt: serverTimestamp(),
    });
    return { created: true };
  } else {
    await setDoc(ref, payload, { merge: true });
    return { created: false };
  }
}
