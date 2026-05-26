export const RECENTLY_VIEWED_LISTINGS_KEY = "sooqna_recently_viewed_listings_v1";

const MAX_RECENTLY_VIEWED_LISTINGS = 12;

export function getRecentlyViewedListingIds(storage?: Storage): string[] {
  const store = storage ?? getBrowserStorage();
  if (!store) return [];

  try {
    const parsed = JSON.parse(store.getItem(RECENTLY_VIEWED_LISTINGS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .slice(0, MAX_RECENTLY_VIEWED_LISTINGS);
  } catch {
    return [];
  }
}

export function addRecentlyViewedListingId(listingId: string, storage?: Storage): string[] {
  const id = listingId.trim();
  if (!id) return getRecentlyViewedListingIds(storage);

  const store = storage ?? getBrowserStorage();
  if (!store) return [];

  const next = [id, ...getRecentlyViewedListingIds(store).filter((item) => item !== id)].slice(
    0,
    MAX_RECENTLY_VIEWED_LISTINGS
  );
  store.setItem(RECENTLY_VIEWED_LISTINGS_KEY, JSON.stringify(next));
  return next;
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
