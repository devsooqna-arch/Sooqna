# Phase 4: Search, Filters & Listing Cards

## Supported Query Params

| Param     | Type   | Description                          | Example              |
|-----------|--------|--------------------------------------|----------------------|
| search    | string | Free text search (title+description) | `search=سيارة`       |
| category  | string | Category slug from whitelist         | `category=cars`      |
| city      | string | City value (alias-normalized)        | `city=aleppo`        |
| sort      | enum   | `newest`, `price_asc`, `price_desc`  | `sort=price_asc`     |
| priceMin  | number | Minimum price filter                 | `priceMin=1000`      |
| priceMax  | number | Maximum price filter                 | `priceMax=50000`     |
| page      | number | Page number (1-based)                | `page=2`             |

## Sort Values (Whitelisted)

- `newest` (default) — featured first, then by createdAt desc
- `price_asc` — featured first, then price ascending
- `price_desc` — featured first, then price descending

Invalid sort values are normalized to `newest`.

## Filter Behavior

- All filters are URL-driven: state is read from and written to URL query params.
- Refreshing the page preserves filters. Sharing the URL reproduces the same results.
- Changing any filter resets page to 1.
- "Clear filters" removes all query params and returns to `/listings`.
- Active filters are shown as removable chips above results.
- Category filter is validated against backend whitelist (CATEGORY_IDS).
- City filter is normalized via alias map (Arabic and English accepted).
- Price filters are applied only when > 0.

## Pagination

- Offset-based: `limit=12`, `offset=(page-1)*12`
- Backend response includes: `total`, `totalPages`, `currentPage`, `hasNextPage`, `hasPreviousPage`
- Page auto-corrects if > totalPages
- Previous/Next buttons disabled at boundaries
- Page numbers with ellipsis for large counts

## Listing Card Fields

- Primary image (with fallback placeholder)
- Title (2-line clamp)
- Price + currency + price type label
- City + area (Arabic)
- Relative time (Arabic)
- Featured badge
- Image count badge (when > 1)
- View count (when > 0)
- Favorite button (guest-safe: redirects to login)

## Empty State

- Shows when no listings match after loading completes
- Displays: icon, Arabic message, active filter chips, clear filters button, browse all button, add listing CTA

## Error State

- Shows when API fails
- Displays: icon, Arabic error message, error details, retry button

## Backend API (GET /api/listings)

- Public: no auth required
- Returns only `status=published`, `deletedAt=null`, `expiresAt > now`
- Response uses `toPublicListing()` which strips: `titleLower`, `clientRequestId`, `isApproved`, `soldAt`, `archivedAt`, `expiresAt`, `updatedAt`, `deletedAt`
- Adds `imageCount` field
- Includes pagination metadata: `currentPage`, `totalPages`, `hasNextPage`, `hasPreviousPage`

## Backend Limitations

- Search uses SQL `LIKE %...%` (contains) — adequate for current scale
- No full-text search index — consider adding pg_trgm or external search in future
- Category-specific fields (e.g., car model, real estate area) not supported yet
- Subcategory filtering not supported by backend (subcategories are static frontend labels)

## Future Improvements (Phase 5+)

- Full-text search with pg_trgm or Meilisearch
- Subcategory filtering on backend
- "Has images" filter
- "Featured only" filter
- Map-based browsing
- Saved searches
- Recently viewed
