import {
  onAuthStateChanged,
  type User as FirebaseAuthUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type FieldValue,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserProfileBootstrap = {
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  role: "user";
  accountStatus: "active";
  isEmailVerified: boolean;
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

/**
 * When a user signs in, ensure `users/{uid}` exists.
 * Uses `getDoc` + `setDoc` with `serverTimestamp()` for first-time creation.
 *
 * @returns Unsubscribe function — call on unmount (e.g. in a Client Component `useEffect`).
 */
export function subscribeEnsureUserProfile(
  onError?: (error: unknown) => void
): () => void {
  return onAuthStateChanged(auth, async (user: FirebaseAuthUser | null) => {
    if (!user) {
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        return;
      }

      const payload: UserProfileBootstrap = {
        uid: user.uid,
        fullName: user.displayName ?? "",
        email: user.email ?? "",
        photoURL: user.photoURL ?? "",
        role: "user",
        accountStatus: "active",
        isEmailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, payload);
    } catch (error) {
      onError?.(error);
    }
  });
}
