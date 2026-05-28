# API Reference

All backend routes are mounted under `/api`.

## Public And Authenticated Modules

- `GET /health`
- `/auth`
- `/users`
- `/listings`
- `/favorites`
- `/messages`
- `/categories`
- `/cities`
- `/engagement`
- `/reports`
- `/reviews`
- `/audit`
- `/contact`

## Admin Module

All `/api/admin/*` routes require:

1. Firebase ID token.
2. Current synced local user.
3. Active account status.
4. `ADMIN` role.

Important admin routes:

- `GET /admin/stats`
- `GET /admin/analytics`
- `GET /admin/health`
- `GET /admin/users`
- `PATCH /admin/users/:id`
- `GET /admin/users/:id/details`
- `GET /admin/listings`
- `POST /admin/listings/:id/publish`
- `POST /admin/listings/:id/reject`
- `POST /admin/listings/:id/archive`
- `POST /admin/listings/:id/sold`
- `POST /admin/listings/:id/feature`
- `POST /admin/listings/:id/unfeature`
- `POST /admin/moderation/listings/bulk`
- `GET /admin/moderation/listings/:id/history`
- `GET /admin/cities`
- `POST /admin/cities`
- `PATCH /admin/cities/:id`
- `GET /admin/categories`
- `POST /admin/categories`
- `PATCH /admin/categories/:id`
- `GET /admin/reports`
- `PATCH /admin/reports/:id`
- `GET /admin/audit-logs`

## Response Shape

Most endpoints return:

```json
{
  "success": true,
  "data": {}
}
```

Paginated endpoints also return:

```json
{
  "pagination": {
    "total": 0,
    "limit": 25,
    "offset": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Error Handling

API errors should use structured responses with a clear `code` and `message`. Do not leak internal secrets, credentials, or stack traces.
