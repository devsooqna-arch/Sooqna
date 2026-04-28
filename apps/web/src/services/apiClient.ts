import { auth } from "@/lib/firebase";

const DEFAULT_API_BASE = "http://localhost:5000/api";
/** Abort public requests after 15 s — avoids infinite skeleton on 504s */
const REQUEST_TIMEOUT_MS = 15_000;

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
  options?: RequestInit & { authenticated?: boolean; timeoutMs?: number }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.authenticated) {
    Object.assign(headers, await getAuthHeader());
  }

  const timeoutMs = options?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiBase()}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `API request failed with ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("انتهت مهلة الاتصال بالخادم. تحقق من اتصالك أو حاول لاحقاً.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

