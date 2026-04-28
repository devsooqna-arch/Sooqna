# API Contract v1 (Foundation Lock)

Base URL: `/api`  
Auth: Firebase ID token in `Authorization: Bearer <token>` for protected endpoints.

## Shared Response Contract

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "code": "SOME_ERROR_CODE",
  "message": "Human-readable message",
  "details": {}
}
```

Notes:
- Legacy endpoints still return top-level payload fields (e.g. `listing`, `listings`, `profile`) for backward compatibility.
- New endpoints should return `success + data` consistently.

## Domain Enums / IDs (Frozen)

Canonical source: `backend/sooqna-backend/src/shared/constants/domain.ts`

- `LISTING_PRICE_TYPES`: `fixed | negotiable | contact`
- `LISTING_STATUSES`: `draft | pending | published | rejected | sold | archived`
- `LISTING_CONDITIONS`: `new | used`
- `LISTING_CONTACT_PREFERENCES`: `chat | phone`
- `MESSAGE_TYPES`: `text | image | system`
- `USER_ROLES`: `user`
- `ACCOUNT_STATUSES`: `active`
- `CATEGORY_IDS`:  
  `cars, real-estate, electronics, furniture, jobs, fashion, kids, sports, services, other`
- `CITY_IDS`:  
  `amman, zarqa, irbid, aqaba, salt, madaba, karak, jerash`

## Auth

### `GET /auth/session` (protected)
- Returns authenticated user identity snapshot.

Response:
- `success: true`
- `user: { uid, email }`

## Users

### `POST /users/profile` (protected)
- Upsert profile from token + optional overrides.

Body:
- `fullName?: string`
- `photoURL?: string (url)`

Response:
- `success: true`
- `profile`

### `GET /users/me` (protected)
- Get current profile.

Response:
- `success: true`
- `profile`

## Listings

### `GET /listings`
- Public listing search with server-side filtering + pagination.

Query:
- `limit` (default 20, max 100)
- `offset` (default 0)
- `category` (category id/slug)
- `city` (city value)
- `search` (title/description contains)
- `sort` (`newest | price_asc | price_desc`)

Response:
- `success: true`
- `listings`
- `total`
- `limit`
- `offset`

### `GET /listings/mine` (protected)
- List current user listings.

### `GET /listings/:id`
- Fetch single listing by id.

### `POST /listings` (protected)
- Create listing.

### `PATCH /listings/:id` (protected)
- Partial update listing.

### `DELETE /listings/:id` (protected)
- Soft delete listing.

### `POST /listings/:id/images` (protected)
- Attach listing image.

## Favorites

### `POST /favorites/:listingId` (protected)
- Add favorite.

### `DELETE /favorites/:listingId` (protected)
- Remove favorite.

### `GET /favorites` (protected)
- List favorite ids.

Response:
- `success: true`
- `listingIds: string[]`

## Messages

### `POST /messages/conversations` (protected)
- Create conversation.

### `GET /messages/conversations` (protected)
- List user conversations.

### `GET /messages/conversations/:conversationId` (protected)
- Get conversation by id for current user.

### `POST /messages/conversations/:conversationId/messages` (protected)
- Create message in conversation.

### `GET /messages/conversations/:conversationId/messages` (protected)
- List messages in conversation.

## Categories

### `GET /categories`

Query:
- `activeOnly`: `true | false | 1 | 0` (optional)

Response:
- `success: true`
- `data: Category[]`

## Migration Notes (Week 1)

1. **Enums/IDs source of truth**
   - Use `src/shared/constants/domain.ts` only.
   - Do not hardcode enum strings in services/controllers.

2. **Error contract**
   - Use centralized API error response shape from middleware.
   - Prefer explicit `code` values.

3. **Success contract migration**
   - Existing clients still consume legacy success shapes.
   - Migrate gradually to `success + data` in v2-compatible phases.

4. **DTO stabilization**
   - Shared DTO aliases are in `src/shared/contracts/dtos.ts`.
   - Frontend should align types to DTO names incrementally.
