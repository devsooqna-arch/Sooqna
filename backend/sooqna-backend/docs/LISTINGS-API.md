# Listings API — Phase 2 Documentation

## Listing Lifecycle

```
draft ──→ published ──→ sold       (terminal)
  │           │  ↑       
  │           │  │ (renew)
  │           ↓  │       
  └──────→ archived      
  
published ──→ rejected/suspended  (admin only, future)

Any state ──→ deleted (soft delete)
```

### Status Values

| Status | Description |
|--------|-------------|
| `draft` | Created but not published. Only visible to owner. |
| `pending` | Reserved for future moderation queue. |
| `published` | Live and visible to all users. |
| `sold` | Marked as sold by owner. Terminal state. |
| `archived` | Unpublished/expired/manually archived by owner. |
| `rejected` | Rejected by admin/moderator. |

## Required Fields for Publishing

- `title` (1–160 chars)
- `price` (≥ 0, finite)
- `categoryId` (valid category)
- `location.country`, `location.city`, `location.area`
- At least **1 image** attached

## Image Policy

- Images are uploaded via `POST /api/uploads/listing-image` (multipart, max 5MB, jpg/png/webp).
- Images are attached to a listing via `POST /api/listings/:id/images`.
- First image becomes primary automatically.
- **Deleting the last image from a published listing is prevented** — the service blocks status transitions that require images.
- Image order is deterministic (ascending by `order` field).

## Idempotency / clientRequestId

- `clientRequestId` (8–120 chars) is sent with create requests.
- Unique constraint: `(ownerId, clientRequestId)`.
- If a duplicate `clientRequestId` is sent by the same owner, the existing listing is returned (no duplicate created).
- `clientRequestId` is scoped to the owner — it cannot expose another user's listing.

## Authorization Rules

| Action | Who |
|--------|-----|
| View published listing | Anyone |
| View draft/archived/sold listing | Owner only |
| Create listing | Authenticated, active, email-verified user |
| Edit listing | Owner only (not sold/rejected) |
| Publish | Owner only (requires images) |
| Unpublish / Archive | Owner only |
| Mark sold | Owner only (published → sold) |
| Renew | Owner only (archived → published, requires images) |
| Delete (soft) | Owner only |
| Feature / Unfeature | Admin only |

### Security

- Backend **never trusts** `ownerId`, `userId`, `status`, `role`, or `isFeatured` from frontend.
- Owner is always derived from the authenticated Firebase token → `req.currentUser.firebaseUid`.
- Suspended/deleted accounts are blocked by `requireActiveUser` middleware.
- `isFeatured` can only be set by admin via dedicated endpoint.
- `status` can only be changed via dedicated lifecycle endpoints — never via PATCH.

## Public vs Owner Visibility

- **Public `GET /listings`**: Only `published` + not-expired + not-deleted listings.
- **Public `GET /listings/:id`**: Only published active listings. Returns 404 for draft/archived/sold/rejected/deleted.
- **Owner `GET /listings/mine`**: All owner's non-deleted listings (draft, published, sold, archived).
- **Owner viewing `GET /listings/:id`**: Owner can see their own listing in any non-deleted status.

## Search / Filter / Sort / Pagination

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `limit` | int 1–100 | Results per page (default: 20) |
| `offset` | int ≥ 0 | Skip offset |
| `category` | string | Category ID filter |
| `city` | string | City filter (Arabic aliases supported) |
| `search` | string ≤ 200 | Full-text search in title + description |
| `sort` | enum | `newest` (default), `price_asc`, `price_desc` |
| `priceMin` | number ≥ 0 | Minimum price filter |
| `priceMax` | number ≥ 0 | Maximum price filter |

### Sort Behavior

- Featured listings always appear first within any sort order.
- Tiebreaker: `createdAt DESC`, then `id DESC`.

## Category Model

- Categories have `id`, `nameAr`, `nameEn`, `slug` (unique), `isActive`, `sortOrder`.
- No parent/subcategory relationship currently.
- `slug` has a unique constraint.
- Categories are fetched via `GET /api/categories?activeOnly=true`.
- Results are ordered by `sortOrder ASC`.

## Prisma Migration Notes (Phase 2)

### New Fields Added

- `Listing.soldAt` (DateTime?, nullable) — timestamp when listing was marked sold
- `Listing.archivedAt` (DateTime?, nullable) — timestamp when listing was archived

### New Indexes Added

- `Listing: [locationCity]`
- `Listing: [isFeatured]`
- `Listing: [createdAt]`
- `Listing: [price]`
- `Listing: [expiresAt]`
- `Listing: [categoryId, status, createdAt]`
- `Listing: [locationCity, status, createdAt]`
- `Listing: [isFeatured, status, createdAt]`
- `ListingImage: [listingId, order]` (replaces single `[listingId]`)
- `Category.slug` — unique constraint

### Endpoints Added

- `POST /api/listings/:id/sold` — mark listing as sold
- `POST /api/listings/:id/archive` — archive listing

All changes are **additive** — no columns removed, no renames, no data migration required.
