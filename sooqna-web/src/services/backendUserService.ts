import { apiClient } from "./apiClient";
import type { UserProfile } from "@/types/user";

export async function getMe(): Promise<UserProfile | null> {
  const response = await apiClient<{ success: true; profile: UserProfile | null }>("/users/me", {
    method: "GET",
    authenticated: true,
  });
  return response.profile;
}

