# Admin And Product Analytics Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add useful decision-making analytics and product improvements to Sooqna: moderation SLA, top listing performance, user activity analytics, public market insights, saved searches, and price insights.

**Architecture:** Extend the existing Express admin/public API modules with focused aggregate endpoints, keep analytics calculations on the backend, and render them through small reusable Next.js components. Avoid hardcoded frontend chart data, avoid direct DB access from the frontend, and keep each feature independently testable.

**Tech Stack:** Next.js 15, React 19, TypeScript, Express, Prisma, PostgreSQL, Firebase Auth, Jest, existing admin dashboard components.

---

## Scope And Phasing

This plan is split into five independently shippable phases:

1. Admin operational analytics: moderation SLA and top listings.
2. Admin user activity analytics.
3. Public market insights page/section.
4. Saved searches.
5. Price insights during listing creation.

Each phase should be committed separately. If time is limited, ship phases 1 and 2 first because they improve admin decision-making without changing public user workflows.

## Files To Touch

Backend:

- Modify `backend/sooqna-backend/src/modules/admin/admin.routes.ts` for admin analytics endpoints.
- Modify `backend/sooqna-backend/src/modules/admin/admin.routes.test.ts` for admin endpoint tests.
- Create `backend/sooqna-backend/src/modules/market/market.routes.ts` for public market insights.
- Create `backend/sooqna-backend/src/modules/market/market.routes.test.ts`.
- Modify `backend/sooqna-backend/src/routes/index.ts` to mount `/api/market`.
- Modify `backend/sooqna-backend/prisma/schema.prisma` only for saved searches.
- Create a Prisma migration for saved searches.

Frontend:

- Modify `apps/web/src/types/admin.ts`.
- Modify `apps/web/src/services/adminService.ts`.
- Modify `apps/web/src/components/admin/AdminDashboard.tsx`.
- Modify `apps/web/src/components/admin/charts.tsx` if a new chart helper is needed.
- Create `apps/web/src/types/market.ts`.
- Create `apps/web/src/services/marketService.ts`.
- Create `apps/web/src/app/market-insights/page.tsx`.
- Create `apps/web/src/components/market/MarketInsightsPage.tsx`.
- Modify `apps/web/src/components/home/HomeMarketplace.tsx` to link or summarize market insights.
- Modify `apps/web/src/components/listings/CreateListingForm.tsx` for price insights.
- Modify `apps/web/src/services/listingService.ts` only if the price-insight endpoint belongs there.

Docs:

- Modify `docs/sooqna-website-complete-documentation.md`.
- Modify `docs/product-roadmap.md`.

---

## Task 1: Admin Moderation SLA API

**Files:**

- Modify `backend/sooqna-backend/src/modules/admin/admin.routes.ts`
- Modify `backend/sooqna-backend/src/modules/admin/admin.routes.test.ts`

- [ ] **Step 1: Add failing tests for moderation SLA**

Add tests that call:

```ts
GET /api/admin/analytics/moderation-sla
```

Expected response shape:

```json
{
  "success": true,
  "data": {
    "pendingCount": 3,
    "oldestPendingAgeHours": 18,
    "averageDecisionHours": 6,
    "pendingAgeBuckets": [
      { "label": "0-6h", "count": 1 },
      { "label": "6-24h", "count": 1 },
      { "label": "24h+", "count": 1 }
    ]
  }
}
```

Test cases:

- Non-authenticated request returns `401`.
- Non-admin request returns `403`.
- Admin request returns pending count, oldest pending age, average decision time, and buckets.

- [ ] **Step 2: Run the failing admin test**

Run:

```bash
cd backend/sooqna-backend
npm test -- --runInBand src/modules/admin/admin.routes.test.ts
```

Expected: test fails because the endpoint does not exist.

- [ ] **Step 3: Implement the endpoint**

Add route:

```ts
adminRouter.get("/analytics/moderation-sla", async (_req, res) => {
  const now = new Date();
  const pendingListings = await prisma.listing.findMany({
    where: { deletedAt: null, status: "pending" },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  const decisions = await prisma.listingModerationLog.findMany({
    where: { action: { in: ["publish", "reject", "archive"] } },
    select: { createdAt: true, listingId: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const ageHours = pendingListings.map((listing) =>
    Math.max(0, Math.round((now.getTime() - listing.createdAt.getTime()) / 36e5))
  );

  const pendingAgeBuckets = [
    { label: "0-6h", count: ageHours.filter((hours) => hours <= 6).length },
    { label: "6-24h", count: ageHours.filter((hours) => hours > 6 && hours <= 24).length },
    { label: "24h+", count: ageHours.filter((hours) => hours > 24).length },
  ];

  res.json({
    success: true,
    data: {
      pendingCount: pendingListings.length,
      oldestPendingAgeHours: ageHours[ageHours.length - 1] ?? 0,
      averageDecisionHours: decisions.length ? null : null,
      pendingAgeBuckets,
    },
  });
});
```

Then refine `averageDecisionHours` by joining against listing `createdAt` for the latest 500 moderation decisions and averaging `(decision.createdAt - listing.createdAt)`.

- [ ] **Step 4: Run test again**

Expected: admin tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/sooqna-backend/src/modules/admin/admin.routes.ts backend/sooqna-backend/src/modules/admin/admin.routes.test.ts
git commit -m "Add admin moderation SLA analytics"
```

---

## Task 2: Admin Top Listing Performance API

**Files:**

- Modify `backend/sooqna-backend/src/modules/admin/admin.routes.ts`
- Modify `backend/sooqna-backend/src/modules/admin/admin.routes.test.ts`

- [ ] **Step 1: Add failing tests**

Endpoint:

```ts
GET /api/admin/analytics/top-listings?metric=views|favorites|messages&limit=10
```

Expected response shape:

```json
{
  "success": true,
  "data": [
    {
      "id": "listing-id",
      "title": "Listing title",
      "status": "published",
      "categoryId": "cars",
      "locationCity": "amman",
      "viewsCount": 120,
      "favoritesCount": 14,
      "messagesCount": 8,
      "createdAt": "2026-05-28T00:00:00.000Z"
    }
  ]
}
```

Test cases:

- Invalid `metric` defaults to `views`.
- `limit` is capped at 25.
- Deleted listings are excluded.

- [ ] **Step 2: Implement endpoint with safe ordering**

Use a whitelist:

```ts
const TOP_LISTING_METRICS = ["views", "favorites", "messages"] as const;
```

Map metric to Prisma fields:

```ts
const metricField = {
  views: "viewsCount",
  favorites: "favoritesCount",
  messages: "messagesCount",
}[metric];
```

Query:

```ts
const listings = await prisma.listing.findMany({
  where: { deletedAt: null },
  orderBy: [{ [metricField]: "desc" }, { createdAt: "desc" }] as Prisma.ListingOrderByWithRelationInput[],
  take: limit,
  select: {
    id: true,
    title: true,
    status: true,
    categoryId: true,
    locationCity: true,
    viewsCount: true,
    favoritesCount: true,
    messagesCount: true,
    createdAt: true,
  },
});
```

- [ ] **Step 3: Run tests**

```bash
cd backend/sooqna-backend
npm test -- --runInBand src/modules/admin/admin.routes.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add backend/sooqna-backend/src/modules/admin/admin.routes.ts backend/sooqna-backend/src/modules/admin/admin.routes.test.ts
git commit -m "Add top listing performance analytics"
```

---

## Task 3: Admin User Activity Analytics API

**Files:**

- Modify `backend/sooqna-backend/src/modules/admin/admin.routes.ts`
- Modify `backend/sooqna-backend/src/modules/admin/admin.routes.test.ts`

- [ ] **Step 1: Add failing tests**

Endpoint:

```ts
GET /api/admin/analytics/user-activity
```

Expected response:

```json
{
  "success": true,
  "data": {
    "activeUsers7d": 12,
    "activeUsers30d": 42,
    "usersWithListings7d": 7,
    "usersWithMessages7d": 5,
    "usersWithFavorites7d": 9,
    "newVsActive": [
      { "label": "New users", "count": 8 },
      { "label": "Active users", "count": 12 }
    ]
  }
}
```

- [ ] **Step 2: Implement aggregates**

Use:

- `User.lastLoginAt` for active users.
- `Listing.createdAt` grouped by owner for users with listings.
- `Message.createdAt` grouped by sender for users with messages.
- `Favorite.createdAt` grouped by user for users with favorites.

Use `distinct` where possible and limit date windows to 7 and 30 days.

- [ ] **Step 3: Run tests**

```bash
cd backend/sooqna-backend
npm test -- --runInBand src/modules/admin/admin.routes.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add backend/sooqna-backend/src/modules/admin/admin.routes.ts backend/sooqna-backend/src/modules/admin/admin.routes.test.ts
git commit -m "Add user activity analytics"
```

---

## Task 4: Admin Dashboard UI Cards And Charts

**Files:**

- Modify `apps/web/src/types/admin.ts`
- Modify `apps/web/src/services/adminService.ts`
- Modify `apps/web/src/components/admin/AdminDashboard.tsx`
- Modify `apps/web/src/components/admin/charts.tsx`

- [ ] **Step 1: Add frontend types**

Add types:

```ts
export type AdminModerationSla = {
  pendingCount: number;
  oldestPendingAgeHours: number;
  averageDecisionHours: number | null;
  pendingAgeBuckets: { label: string; count: number }[];
};

export type AdminTopListing = {
  id: string;
  title: string;
  status: string;
  categoryId: string;
  locationCity: string;
  viewsCount: number;
  favoritesCount: number;
  messagesCount: number;
  createdAt: string;
};

export type AdminUserActivity = {
  activeUsers7d: number;
  activeUsers30d: number;
  usersWithListings7d: number;
  usersWithMessages7d: number;
  usersWithFavorites7d: number;
  newVsActive: { label: string; count: number }[];
};
```

- [ ] **Step 2: Add admin service methods**

Add methods:

```ts
export async function getAdminModerationSla(): Promise<AdminModerationSla> {
  return apiClient.get("/admin/analytics/moderation-sla", { auth: true });
}

export async function getAdminTopListings(metric: "views" | "favorites" | "messages"): Promise<AdminTopListing[]> {
  return apiClient.get(`/admin/analytics/top-listings?metric=${metric}`, { auth: true });
}

export async function getAdminUserActivity(): Promise<AdminUserActivity> {
  return apiClient.get("/admin/analytics/user-activity", { auth: true });
}
```

Adjust the exact `apiClient` call shape to match the current `adminService.ts` patterns.

- [ ] **Step 3: Render the UI**

Add an "Operations" subsection inside the existing Analytics or Overview tab:

- KPI cards:
  - Pending listings.
  - Oldest pending age.
  - Average moderation decision time.
  - Active users in 7 days.
- Bar chart:
  - Pending age buckets.
- Table:
  - Top listings with metric selector.
- Small chart:
  - New vs active users.

States:

- Loading skeleton/compact loading text.
- Empty state if arrays are empty.
- Error state with retry.

- [ ] **Step 4: Run frontend verification**

```bash
cd apps/web
npm run lint
npm run build
```

- [ ] **Step 5: Browser check**

Open:

```text
http://localhost:3000/admin
```

Verify:

- Analytics tab loads.
- New cards fit desktop and mobile.
- Top listings table scrolls on mobile.
- Errors are readable.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/types/admin.ts apps/web/src/services/adminService.ts apps/web/src/components/admin/AdminDashboard.tsx apps/web/src/components/admin/charts.tsx
git commit -m "Add admin operational analytics UI"
```

---

## Task 5: Public Market Insights API

**Files:**

- Create `backend/sooqna-backend/src/modules/market/market.routes.ts`
- Create `backend/sooqna-backend/src/modules/market/market.routes.test.ts`
- Modify `backend/sooqna-backend/src/routes/index.ts`

- [ ] **Step 1: Add route test**

Endpoint:

```ts
GET /api/market/insights
```

Expected response:

```json
{
  "success": true,
  "data": {
    "topCities": [{ "city": "amman", "listingCount": 50 }],
    "topCategories": [{ "categoryId": "cars", "listingCount": 40 }],
    "averagePricesByCategory": [{ "categoryId": "cars", "averagePrice": 8500 }],
    "newListings7d": 20
  }
}
```

- [ ] **Step 2: Implement public market router**

Use aggregate Prisma queries:

- `listing.groupBy({ by: ["locationCity"], where: { deletedAt: null, status: "published" } })`
- `listing.groupBy({ by: ["categoryId"], where: { deletedAt: null, status: "published" } })`
- `listing.groupBy({ by: ["categoryId"], _avg: { price: true } })`
- `listing.count({ where: { createdAt: { gte: sevenDaysAgo }, status: "published", deletedAt: null } })`

Limit all group results to 10.

- [ ] **Step 3: Mount the route**

In `backend/sooqna-backend/src/routes/index.ts`:

```ts
import { marketRouter } from "../modules/market/market.routes";
apiRouter.use("/market", marketRouter);
```

- [ ] **Step 4: Run tests**

```bash
cd backend/sooqna-backend
npm test -- --runInBand src/modules/market/market.routes.test.ts
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add backend/sooqna-backend/src/modules/market backend/sooqna-backend/src/routes/index.ts
git commit -m "Add public market insights API"
```

---

## Task 6: Public Market Insights Page

**Files:**

- Create `apps/web/src/types/market.ts`
- Create `apps/web/src/services/marketService.ts`
- Create `apps/web/src/components/market/MarketInsightsPage.tsx`
- Create `apps/web/src/app/market-insights/page.tsx`
- Modify `apps/web/src/components/home/HomeMarketplace.tsx`

- [ ] **Step 1: Add frontend market type**

```ts
export type MarketInsights = {
  topCities: { city: string; listingCount: number }[];
  topCategories: { categoryId: string; listingCount: number }[];
  averagePricesByCategory: { categoryId: string; averagePrice: number }[];
  newListings7d: number;
};
```

- [ ] **Step 2: Add service**

```ts
export async function getMarketInsights(): Promise<MarketInsights> {
  return apiClient.get("/market/insights");
}
```

Match the current `apiClient` response unwrapping style.

- [ ] **Step 3: Build page**

Page content:

- KPI card: new listings in last 7 days.
- Bar chart/list: most active cities.
- Bar chart/list: most active categories.
- Table: average price by category.
- Link back to listings filtered by city/category where possible.

States:

- Loading.
- Error with retry.
- Empty state when no published listings exist.

- [ ] **Step 4: Link from home**

Add a subtle link/section in `HomeMarketplace.tsx`:

```text
إحصائيات السوق
```

Route:

```text
/market-insights
```

- [ ] **Step 5: Verify**

```bash
cd apps/web
npm run lint
npm run build
```

Browser:

```text
http://localhost:3000/market-insights
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/types/market.ts apps/web/src/services/marketService.ts apps/web/src/components/market/MarketInsightsPage.tsx apps/web/src/app/market-insights/page.tsx apps/web/src/components/home/HomeMarketplace.tsx
git commit -m "Add public market insights page"
```

---

## Task 7: Saved Searches Database And API

**Files:**

- Modify `backend/sooqna-backend/prisma/schema.prisma`
- Create Prisma migration
- Create `backend/sooqna-backend/src/modules/saved-searches/savedSearches.routes.ts`
- Create `backend/sooqna-backend/src/modules/saved-searches/savedSearches.routes.test.ts`
- Modify `backend/sooqna-backend/src/routes/index.ts`

- [ ] **Step 1: Add Prisma model**

```prisma
model SavedSearch {
  id        String   @id @default(cuid())
  userId    String
  name      String
  query     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [firebaseUid], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

Also add to `User`:

```prisma
savedSearches SavedSearch[]
```

- [ ] **Step 2: Create migration**

```bash
cd backend/sooqna-backend
npm run prisma:migrate -- --name add_saved_searches
```

- [ ] **Step 3: Add tests**

Endpoints:

- `GET /api/saved-searches`
- `POST /api/saved-searches`
- `DELETE /api/saved-searches/:id`

Rules:

- Requires signed-in active user.
- User can only see/delete their own saved searches.
- Search name max length 80.
- Query must be an object.

- [ ] **Step 4: Implement routes**

Use `verifyFirebaseToken`, `requireCurrentUser`, and `requireActiveUser`.

Store query as JSON with allowed keys only:

- `q`
- `category`
- `city`
- `minPrice`
- `maxPrice`
- `condition`

- [ ] **Step 5: Mount routes**

In `src/routes/index.ts`:

```ts
apiRouter.use("/saved-searches", savedSearchesRouter);
```

- [ ] **Step 6: Verify**

```bash
cd backend/sooqna-backend
npm run prisma:generate
npm run typecheck
npm test -- --runInBand src/modules/saved-searches/savedSearches.routes.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add backend/sooqna-backend/prisma backend/sooqna-backend/src/modules/saved-searches backend/sooqna-backend/src/routes/index.ts
git commit -m "Add saved searches API"
```

---

## Task 8: Saved Searches Frontend

**Files:**

- Create `apps/web/src/types/savedSearch.ts`
- Create `apps/web/src/services/savedSearchService.ts`
- Modify `apps/web/src/components/listings/PublicListingsPage.tsx`
- Modify `apps/web/src/components/me/AccountDashboard.tsx`

- [ ] **Step 1: Add type and service**

Type:

```ts
export type SavedSearch = {
  id: string;
  name: string;
  query: Record<string, string | number | null>;
  createdAt: string;
  updatedAt: string;
};
```

Service methods:

- `getSavedSearches()`
- `createSavedSearch(name, query)`
- `deleteSavedSearch(id)`

- [ ] **Step 2: Add save button on listings page**

When user is signed in and filters/search are active, show:

```text
حفظ البحث
```

Behavior:

- Opens a small modal/input for search name.
- Saves current query params.
- Shows success/error.

- [ ] **Step 3: Show saved searches in account dashboard**

Add a compact list:

- Search name.
- Created date.
- Open search.
- Delete.

- [ ] **Step 4: Verify**

```bash
cd apps/web
npm run lint
npm run build
```

Browser checks:

- Save a search from `/listings`.
- Open it from `/me`.
- Delete it.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/types/savedSearch.ts apps/web/src/services/savedSearchService.ts apps/web/src/components/listings/PublicListingsPage.tsx apps/web/src/components/me/AccountDashboard.tsx
git commit -m "Add saved searches UI"
```

---

## Task 9: Price Insights API

**Files:**

- Modify `backend/sooqna-backend/src/modules/listings/listings.routes.ts`
- Modify or create listing route tests in `backend/sooqna-backend/src/modules/listings`

- [ ] **Step 1: Add failing test**

Endpoint:

```ts
GET /api/listings/price-insights?categoryId=cars&city=amman&condition=used
```

Expected response:

```json
{
  "success": true,
  "data": {
    "sampleSize": 12,
    "averagePrice": 8300,
    "minPrice": 4500,
    "maxPrice": 12000,
    "confidence": "medium"
  }
}
```

Rules:

- Only published, non-deleted listings.
- Filter by category.
- Filter by city when provided.
- Filter by condition when provided.
- If sample size is under 5, confidence is `low`.
- If sample size is 5 to 19, confidence is `medium`.
- If sample size is 20 or more, confidence is `high`.

- [ ] **Step 2: Implement aggregate endpoint**

Use Prisma aggregate:

```ts
const stats = await prisma.listing.aggregate({
  where: {
    deletedAt: null,
    status: "published",
    categoryId,
    locationCity: city,
    condition,
  },
  _count: { _all: true },
  _avg: { price: true },
  _min: { price: true },
  _max: { price: true },
});
```

Build response from `_count`, `_avg`, `_min`, `_max`.

- [ ] **Step 3: Verify**

```bash
cd backend/sooqna-backend
npm test -- --runInBand src/modules/listings
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add backend/sooqna-backend/src/modules/listings
git commit -m "Add listing price insights API"
```

---

## Task 10: Price Insights In Submit Listing UI

**Files:**

- Modify `apps/web/src/services/listingService.ts`
- Modify `apps/web/src/components/listings/CreateListingForm.tsx`

- [ ] **Step 1: Add service method**

```ts
export type ListingPriceInsights = {
  sampleSize: number;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  confidence: "low" | "medium" | "high";
};
```

Add:

```ts
export async function getListingPriceInsights(params: {
  categoryId: string;
  city?: string;
  condition?: string;
}): Promise<ListingPriceInsights> {
  const query = new URLSearchParams();
  query.set("categoryId", params.categoryId);
  if (params.city) query.set("city", params.city);
  if (params.condition) query.set("condition", params.condition);
  return apiClient.get(`/listings/price-insights?${query.toString()}`);
}
```

- [ ] **Step 2: Render price guidance**

In `CreateListingForm.tsx`, when category and city are selected:

- Fetch insights with debounce.
- Show average/min/max.
- When the entered price is above max, show a soft warning.
- When the entered price is below min, show a soft warning.
- When confidence is low, label the insight as limited data.

- [ ] **Step 3: Verify**

```bash
cd apps/web
npm run lint
npm run build
```

Browser:

- Open `/submit-listing`.
- Pick category/city/condition.
- Confirm insight card appears.
- Enter low/high price and confirm the message changes.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/services/listingService.ts apps/web/src/components/listings/CreateListingForm.tsx
git commit -m "Add price insights to listing submission"
```

---

## Task 11: Documentation Update

**Files:**

- Modify `docs/sooqna-website-complete-documentation.md`
- Modify `docs/product-roadmap.md`

- [ ] **Step 1: Update complete docs**

Add sections for:

- Moderation SLA analytics.
- Top listing performance.
- User activity analytics.
- Public market insights.
- Saved searches.
- Price insights.

- [ ] **Step 2: Update roadmap**

Move completed items from recommended next phase into implemented/current capabilities.

- [ ] **Step 3: Commit**

```bash
git add docs/sooqna-website-complete-documentation.md docs/product-roadmap.md
git commit -m "Document analytics and marketplace enhancements"
```

---

## Final Verification

Run:

```bash
cd backend/sooqna-backend
npm run prisma:generate
npm run typecheck
npm test
```

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Browser checks:

- `http://localhost:3000/`
- `http://localhost:3000/admin`
- `http://localhost:3000/market-insights`
- `http://localhost:3000/listings`
- `http://localhost:3000/submit-listing`
- `http://localhost:3000/me`

API checks:

- `GET http://localhost:5000/api/health`
- `GET http://localhost:5000/api/market/insights`
- Admin-authenticated checks for `/api/admin/analytics/moderation-sla`, `/api/admin/analytics/top-listings`, and `/api/admin/analytics/user-activity`.

## Risks

- Saved searches require a database migration and should be deployed carefully.
- Price insights are only as good as the number and quality of comparable listings.
- Public market insights should not expose private, rejected, archived, or deleted listings.
- Admin analytics queries must stay limited and indexed to avoid expensive scans.

## Recommended Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 9
8. Task 10
9. Task 7
10. Task 8
11. Task 11

This order ships high-value admin analytics first, then public insights, then price guidance, and saves the database-heavy saved searches feature for after the lower-risk analytics work.
