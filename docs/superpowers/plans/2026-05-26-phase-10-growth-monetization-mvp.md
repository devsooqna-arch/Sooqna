# Phase 10 Growth Monetization MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe growth and monetization MVP features without schema migrations, real payments, or security changes.

**Architecture:** Use existing public listing APIs for similar listings and recently viewed listings. Keep recently viewed storage client-only in localStorage, expose owner performance from existing listing fields, and reserve featured listing mutation for admin surfaces only.

**Tech Stack:** Next.js, React, TypeScript, Tailwind, Express, Prisma, Jest, Node test runner where existing frontend tests already use it.

---

### Task 1: Recently Viewed Storage Helper

**Files:**
- Create: `apps/web/src/lib/recentlyViewedListings.ts`
- Test: `apps/web/tests/recentlyViewedListings.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addRecentlyViewedListingId,
  getRecentlyViewedListingIds,
  RECENTLY_VIEWED_LISTINGS_KEY,
} from "../src/lib/recentlyViewedListings";

test("addRecentlyViewedListingId keeps newest id first and removes duplicates", () => {
  const storage = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  } as Storage;

  addRecentlyViewedListingId("lst_1", localStorage);
  addRecentlyViewedListingId("lst_2", localStorage);
  addRecentlyViewedListingId("lst_1", localStorage);

  assert.deepEqual(getRecentlyViewedListingIds(localStorage), ["lst_1", "lst_2"]);
  assert.equal(storage.has(RECENTLY_VIEWED_LISTINGS_KEY), true);
});

test("addRecentlyViewedListingId limits stored ids", () => {
  const storage = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  } as Storage;

  for (let i = 1; i <= 14; i += 1) {
    addRecentlyViewedListingId(`lst_${i}`, localStorage);
  }

  assert.deepEqual(getRecentlyViewedListingIds(localStorage), [
    "lst_14",
    "lst_13",
    "lst_12",
    "lst_11",
    "lst_10",
    "lst_9",
    "lst_8",
    "lst_7",
    "lst_6",
    "lst_5",
    "lst_4",
    "lst_3",
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web; npx tsx --test tests/recentlyViewedListings.test.ts`

Expected: FAIL because `recentlyViewedListings` does not exist.

- [ ] **Step 3: Implement helper**

Create helper with `RECENTLY_VIEWED_LISTINGS_KEY`, `getRecentlyViewedListingIds`, and `addRecentlyViewedListingId`, limiting to 12 ids and tolerating invalid JSON.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web; npx tsx --test tests/recentlyViewedListings.test.ts`

Expected: PASS.

### Task 2: Similar Listings And Recently Viewed UI

**Files:**
- Modify: `apps/web/src/components/listings/ListingDetailsView.tsx`
- Modify: `apps/web/src/components/home/HomeMarketplace.tsx`

- [ ] **Step 1: Add client-only recently viewed flow**

On listing detail load, store current listing id with `addRecentlyViewedListingId`. On homepage load, read ids from localStorage, fetch public listings through `getListingsByIds`, and render a compact "شوهدت مؤخراً" section if results exist.

- [ ] **Step 2: Add similar listings flow**

On listing detail page, after the listing loads, fetch `getListingsFiltered({ category, city, limit: 7 })`, exclude the current id, and render up to 6 published listings using `ListingCard`.

- [ ] **Step 3: Verify manually with lint/build**

Run frontend lint and build after all UI changes.

### Task 3: Owner Performance And Featured Safety

**Files:**
- Modify: `apps/web/src/components/listings/MyListingsPageView.tsx`
- Modify: `apps/web/src/components/admin/AdminDashboard.tsx`

- [ ] **Step 1: Remove owner feature/unfeature action**

Remove imports and owner buttons for `featureListing` and `unfeatureListing` from `MyListingsPageView`. Keep featured status visible.

- [ ] **Step 2: Add owner performance summary**

For each listing in `/my-listings`, show views, favorites, messages, status, published date, expiry, and featured status from fields already returned by `/listings/mine`.

- [ ] **Step 3: Add admin growth columns**

Keep existing admin feature/unfeature actions and display featured status clearly. Avoid adding payment or billing placeholders to admin mutation APIs.

### Task 4: Packages Page And Documentation

**Files:**
- Modify: `apps/web/src/app/packages/page.tsx`
- Create: `docs/phase-10-growth-monetization.md`

- [ ] **Step 1: Refine packages page**

Show Free Listing, Featured Listing, Boosted Listing, and Business Seller Package as future/coming-soon packages with contact CTA. Do not add checkout or payment collection.

- [ ] **Step 2: Write Phase 10 documentation**

Document implemented MVP, featured rules, recently viewed privacy, similar listing logic, owner stats, payment planning, and remaining risks.

### Task 5: Verification

**Files:**
- No code files.

- [ ] **Step 1: Frontend verification**

Run: `cd apps/web; npm run lint`

Run: `cd apps/web; npm run build`

- [ ] **Step 2: Backend verification**

If backend files changed, run: `cd backend/sooqna-backend; npm run typecheck`, `npm run build`, and `npm test -- --runInBand`.

- [ ] **Step 3: Final report**

Prepare Arabic report with audit, files changed, implemented features, verification results, risks, and next steps.
