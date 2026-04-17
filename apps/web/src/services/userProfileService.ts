import { type User } from "firebase/auth";
import { apiFetch } from "@/services/apiClient";

/**
 * Creates or merges backend profile from Firebase-authenticated user context.
 */
export async function ensureUserProfile(
  user: User,
  options?: { fullName?: string }
): Promise<{ created: boolean }> {
  const fullName = options?.fullName?.trim() || user.displayName?.trim() || "";
  const response = await apiFetch<{ success: true; profile: { uid: string } }>(
    "/users/profile",
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify({
        fullName,
        photoURL: user.photoURL ?? "",
      }),
    }
  );
  return { created: Boolean(response.profile.uid) };
}
