# Phase 7 - Admin Dashboard & Moderation

## Admin Routes

- Frontend: `/admin`
- Backend namespace: `/api/admin/*`
- Existing admin-backed routes retained:
  - `GET /api/reports/queue`
  - `PATCH /api/reports/:id`
  - `GET /api/audit/logs`

The `/admin` page uses a client-side UX guard only. The backend remains the source of truth and every `/api/admin/*` route verifies the Firebase bearer token, loads PostgreSQL `User.role`, checks `accountStatus === "active"`, and requires `Role.ADMIN`.

## Admin API Endpoints

- `GET /api/admin/stats`
- `GET /api/admin/listings`
- `POST /api/admin/listings/:id/publish`
- `POST /api/admin/listings/:id/reject`
- `POST /api/admin/listings/:id/archive`
- `POST /api/admin/listings/:id/sold`
- `POST /api/admin/listings/:id/feature`
- `POST /api/admin/listings/:id/unfeature`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:id`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `GET /api/admin/audit-logs`

List endpoints are paginated. Admin audit log metadata is sanitized for common secret-like keys before returning it to the UI.

## Role Permission Matrix

Actual implemented roles in the current Prisma schema:

| Role | Permissions |
| --- | --- |
| `BUYER` | Own profile, marketplace browsing, favorites, messages, report submission. |
| `SELLER` | Buyer permissions plus own listing lifecycle actions. |
| `ADMIN` | Admin dashboard, stats, all-listings moderation, users, reports, categories, audit logs. |

`moderator` and `super_admin` are not implemented because the current schema only supports `ADMIN`, `BUYER`, and `SELLER`. Phase 7 does not add a role/schema migration.

## Listing Moderation Flow

Admin listing actions are explicit backend endpoints, not arbitrary frontend status mutation:

- publish
- reject
- archive
- mark sold
- feature
- unfeature

Each action writes `AuditLog` with an `admin.listing.*` action and optional reason metadata.

## Report Lifecycle

Reports can move between:

- `open`
- `in_review`
- `resolved`
- `rejected`

Admin report updates write `admin.report.update` audit events.

## User Role And Status Management

Admins can list users and update:

- `role`: `ADMIN`, `BUYER`, `SELLER`
- `accountStatus`: `active`, `suspended`, `deleted`

All updates write `admin.user.update` audit events. Suspended and deleted accounts are blocked by `requireActiveUser` on protected business/admin routes that use the current auth context.

## Category Management Rules

Admins can list, create, and update categories. Delete is intentionally not implemented in Phase 7 because categories may be referenced by listings and the current backend does not yet provide a safe dependency-aware delete policy.

## Audit Logging Behavior

Admin mutations added in Phase 7 write audit logs:

- listing moderation
- user role/status updates
- report updates
- category create/update

Audit logs are read-only in the UI.

## Security Notes

- Frontend guards are for user experience only.
- Backend checks PostgreSQL `User.role`, never a frontend-provided role.
- `/api/dev/seed-summary` is now admin-protected.
- Admin list endpoints are paginated.
- No Prisma schema migration was added.
- Current auth model uses Firebase bearer tokens, not cookie sessions, so CSRF exposure is limited to bearer-token handling.

## Remaining Limitations

- No `moderator` or `super_admin` role exists yet.
- Admin category delete/reorder drag-and-drop is not implemented.
- Report rows are not enriched with full target/user/message details yet.
- Admin UI is V1 and intentionally operational rather than a full design-system expansion.
