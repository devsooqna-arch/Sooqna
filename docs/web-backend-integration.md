# Web <-> Backend Integration

## Auth flow

1. User signs in on web via Firebase Auth.
2. Web gets ID token from current Firebase user.
3. Web sends token:
   - `Authorization: Bearer <token>`
4. Backend verifies token and authorizes protected actions.

## Web API layer

Use service files in `sooqna-web/src/services`:

- `apiClient.ts` (shared fetch + bearer token)
- `backendAuthService.ts`
- `backendUserService.ts`
- `backendListingService.ts`
- `backendUploadService.ts`
- `backendFavoriteService.ts`
- `backendMessageService.ts`

## Environment

Set:

- `NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:5000/api`

