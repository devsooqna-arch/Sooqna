import type { Listing } from "@/types/listing";

const DEFAULT_API_BASE = "http://localhost:5000/api";

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? DEFAULT_API_BASE;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export async function fetchPublicListingById(listingId: string): Promise<Listing | null> {
  try {
    const response = await fetch(`${apiBase()}/listings/${listingId}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { success: boolean; listing?: Listing };
    return data.listing ?? null;
  } catch {
    return null;
  }
}

export async function fetchPublicListings(limit = 200): Promise<Listing[]> {
  try {
    const timeoutMs = toNumber(process.env.NEXT_PUBLIC_SITEMAP_FETCH_TIMEOUT_MS, 7000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${apiBase()}/listings`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return [];
    const data = (await response.json()) as { success: boolean; listings?: Listing[] };
    const listings = Array.isArray(data.listings) ? data.listings : [];
    return listings.slice(0, limit);
  } catch {
    return [];
  }
}
