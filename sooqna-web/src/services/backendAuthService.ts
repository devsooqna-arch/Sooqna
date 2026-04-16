import { apiClient } from "./apiClient";
import type { UserProfile } from "@/types/user";

export async function syncProfile(input?: {
  fullName?: string;
  photoURL?: string;
}): Promise<UserProfile> {
  const response = await apiClient<{ success: true; profile: UserProfile }>("/users/profile", {
    method: "POST",
    body: JSON.stringify(input ?? {}),
    authenticated: true,
  });
  return response.profile;
}

