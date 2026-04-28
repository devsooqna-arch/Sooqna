import { apiFetch } from "./apiClient";

export type BackendProfile = {
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  role: "user";
  accountStatus: "active";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function syncBackendProfile(input?: {
  fullName?: string;
  photoURL?: string;
}): Promise<BackendProfile> {
  const response = await apiFetch<{ success: true; data: { profile: BackendProfile } }>(
    "/users/profile",
    {
      method: "PATCH",
      body: JSON.stringify(input ?? {}),
      authenticated: true,
    }
  );
  return response.data.profile;
}

export async function getBackendMe(): Promise<BackendProfile | null> {
  const response = await apiFetch<{ success: true; data: { profile: BackendProfile | null } }>(
    "/users/me",
    {
      method: "GET",
      authenticated: true,
    }
  );
  return response.data.profile;
}

