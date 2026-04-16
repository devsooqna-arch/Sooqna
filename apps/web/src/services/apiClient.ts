import { auth } from "@/lib/firebase";

const DEFAULT_API_BASE = "http://localhost:5000/api";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? DEFAULT_API_BASE;
}

export async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) {
    return {};
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { authenticated?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.authenticated) {
    Object.assign(headers, await getAuthHeader());
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

