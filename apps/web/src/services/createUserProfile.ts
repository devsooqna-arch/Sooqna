import {
  onAuthStateChanged,
  type User as FirebaseAuthUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUserProfile } from "@/services/userProfileService";

/**
 * When a user signs in, ensure `users/{uid}` exists (shared logic with auth flows).
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
      await ensureUserProfile(user);
    } catch (error) {
      onError?.(error);
    }
  });
}
