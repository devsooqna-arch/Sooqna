# Admin Dashboard

The admin dashboard lives at `/admin`.

## Access Control

An admin must:

- Be signed in through Firebase Auth.
- Exist in the local `User` table.
- Have `accountStatus=active`.
- Have `role=ADMIN`.

The public header shows the admin dashboard link only after backend-confirmed admin status.

## Current Sections

- Overview: basic counts and recent audit actions.
- Analytics: KPIs, daily/weekly growth, listing status distribution, top cities, top categories.
- Moderation: listing queue, filters, single actions, bulk publish/reject/archive, moderation history.
- Listings: listing lifecycle and feature controls.
- Users: role/status filters, promote/demote, suspend/activate, details view.
- Reports: moderation reports.
- Categories: category management.
- Cities: city management with active status, sort order, and listing counts.
- System Health: API, database, uploads, Firebase/Auth and DB sync diagnostics.
- Audit Logs: searchable audit events.

## Moderation Rules

- Reject actions require a reason.
- Publish/reject/archive actions write `ListingModerationLog`.
- Admin actions write `AuditLog`.
- Bulk actions are capped server-side.

## City Management

Cities are stored in the `City` table and exposed through public/admin APIs.

Current listing-city compatibility still uses `Listing.locationCity`. The recommended next step is a controlled `cityId` migration.

## Auth Sync Diagnostics

System Health displays:

- Firebase project id.
- Firebase Admin credential mode.
- DB user count.
- Firebase Auth count when Admin SDK credentials are available.

This prevents confusion between Firebase Auth users and local DB users.
