import { auth } from "@/lib/firebase";
import { API_BASE_URL } from "@/lib/api";

async function authHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { authenticated?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (options?.authenticated) {
    Object.assign(headers, await authHeaders());
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return (await response.json()) as T;
}

