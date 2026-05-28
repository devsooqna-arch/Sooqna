# Architecture

## System Overview

Sooqna is a classifieds marketplace with a Next.js frontend and an Express backend.

```text
Browser
  -> apps/web (Next.js)
  -> backend/sooqna-backend (/api)
  -> PostgreSQL (Prisma)

Firebase Auth
  -> issues client ID tokens
  -> backend verifies tokens
```

## Source Of Truth

- Firebase Auth owns identity: UID, email provider, sign-in.
- PostgreSQL owns product data: users, roles, listings, categories, cities, reports, moderation logs, messages, favorites, reviews, uploads metadata.
- The backend syncs authenticated Firebase users into the local `User` table.
- Admin roles are stored in PostgreSQL, not Firebase custom claims.

## Active Applications

- `apps/web`: public site, account flows, listing workflows, admin dashboard.
- `backend/sooqna-backend`: REST API, auth guards, database access, uploads, admin workflows.

## Database Models

Important models:

- `User`: local profile, role, account status, trust fields, last login.
- `Listing`: marketplace listing and lifecycle state.
- `City`: admin-managed city catalog.
- `Category`: admin-managed category catalog.
- `ListingModerationLog`: traceable listing moderation history.
- `AuditLog`: admin and product audit trail.
- `Upload`: uploaded file metadata.
- `Report`: user-submitted moderation reports.

## Runtime Boundaries

- Frontend never talks directly to PostgreSQL.
- Frontend never uses Firebase Admin.
- Backend does not expose secrets in health/admin endpoints.
- Public routes use public APIs; admin routes require Firebase token + active user + `ADMIN` role.

## Compatibility Notes

Listings currently store city as `locationCity` text for backward compatibility. The next database improvement is a safe `cityId` migration:

1. Add nullable `cityId`.
2. Backfill from `locationCity`.
3. Dual-write city text and `cityId`.
4. Update reads and filters.
5. Add FK/constraints after data is clean.
