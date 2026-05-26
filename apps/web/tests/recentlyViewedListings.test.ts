import assert from "node:assert/strict";
import {
  addRecentlyViewedListingId,
  getRecentlyViewedListingIds,
  RECENTLY_VIEWED_LISTINGS_KEY,
} from "../src/lib/recentlyViewedListings";

function makeStorage(): Storage {
  const storage = new Map<string, string>();
  return {
    get length() {
      return storage.size;
    },
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
  };
}

{
  const localStorage = makeStorage();

  addRecentlyViewedListingId("lst_1", localStorage);
  addRecentlyViewedListingId("lst_2", localStorage);
  addRecentlyViewedListingId("lst_1", localStorage);

  assert.deepEqual(
    getRecentlyViewedListingIds(localStorage),
    ["lst_1", "lst_2"],
    "recently viewed listings should keep newest ids first and remove duplicates"
  );
  assert.equal(
    localStorage.getItem(RECENTLY_VIEWED_LISTINGS_KEY) !== null,
    true,
    "recently viewed helper should write to the expected storage key"
  );
}

{
  const localStorage = makeStorage();

  for (let i = 1; i <= 14; i += 1) {
    addRecentlyViewedListingId(`lst_${i}`, localStorage);
  }

  assert.deepEqual(
    getRecentlyViewedListingIds(localStorage),
    ["lst_14", "lst_13", "lst_12", "lst_11", "lst_10", "lst_9", "lst_8", "lst_7", "lst_6", "lst_5", "lst_4", "lst_3"],
    "recently viewed listings should keep storage bounded to 12 ids"
  );
}

{
  const localStorage = makeStorage();
  localStorage.setItem(RECENTLY_VIEWED_LISTINGS_KEY, "not-json");

  assert.deepEqual(
    getRecentlyViewedListingIds(localStorage),
    [],
    "recently viewed helper should tolerate invalid stored JSON"
  );
}
