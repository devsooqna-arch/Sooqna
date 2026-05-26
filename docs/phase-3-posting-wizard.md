# Phase 3 — Posting Wizard & Upload UX

## Wizard Steps

| Step | Key | Label | Fields |
|------|-----|-------|--------|
| 0 | category | التصنيف والموقع | categoryId (required), subcategory (optional), city (required), area (optional) |
| 1 | details | تفاصيل الإعلان | title (required, max 160), description (optional, max 10000) |
| 2 | media | السعر والصور | price (required, non-negative), currency (SYP/USD), images (min 1 for publish, max 10) |
| 3 | preview | المعاينة والنشر | read-only preview, pre-publish checklist, publish button |

## Draft Creation Flow

1. Draft is created **at publish time** (Step 3 submit), not earlier
2. `clientRequestId` is generated once per submission attempt via `useRef`
3. If the same `clientRequestId` is sent twice, backend returns existing draft (idempotency)
4. Flow: create draft → upload images sequentially → attach each → publish
5. Double-click protection: `submittingRef` + `busy` state disable all buttons

## clientRequestId Usage

- Generated: `crypto.randomUUID()` on first submit attempt
- Stored in `clientRequestId.current` ref (survives re-renders, cleared on success)
- Backend: unique constraint on `(ownerId, clientRequestId)` prevents duplicate listings
- On success: ref is cleared to `null`, allowing new listing creation

## Image Upload Policy

- **File types**: JPEG, JPG, PNG, WEBP
- **Max size**: 5 MB per image
- **Max count**: 10 images per listing
- **Upload flow**: file → `POST /uploads/listing-image` (multipart) → `POST /listings/{id}/images` (attach)
- **Primary image**: first image in order (index 0) — frontend allows reordering
- **Backend auto-primary**: first attached image gets `isPrimary: true`

## Publish Requirements

- At least 1 image attached
- All required fields present (title, categoryId, price, city)
- User must be authenticated with verified email
- User account must be active

## Guest / Unverified Behavior

### Guest (not logged in)
- Shows centered CTA card with login and register buttons
- Both buttons include `?next=/submit-listing` for post-login redirect
- No wizard rendered, no blank space

### Unverified Email
- `RequireVerifiedEmailGate` shows amber verification card
- Resend button with 60-second cooldown
- Links to account settings and listings

## Error Handling

- API errors mapped to Arabic messages via `mapApiError()`
- Per-field validation errors shown below each field
- Global errors shown in red banner above the form
- Session expiry errors include page reload button
- Upload failures show per-image error state with visual indicator
- Publish progress shown with spinner during create → upload → publish sequence

## Mobile Notes

- Step indicator: compact on mobile (numbers only), full labels on sm+
- Navigation buttons: sticky bottom bar on mobile, inline on desktop
- Image grid: 2 columns on mobile, 3-4 on larger screens
- Image controls: ◀▶ for reorder, ★ for primary, ✕ for delete
- Upload area: full-width dashed drop zone

## Remaining Improvements (Future Phases)

- Autosave drafts to localStorage for recovery
- Drag-and-drop image reordering
- Backend image delete endpoint (not yet available)
- Backend image reorder endpoint (not yet available)
- Category-specific custom fields
- Condition (new/used) and contact preference fields
- Image cropping/editing before upload
- Upload progress percentage (requires backend streaming)
