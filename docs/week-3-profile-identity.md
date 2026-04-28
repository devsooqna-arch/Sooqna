# Week 3 — Profile + Identity

## Delivered

- Profile API standardized:
  - `GET /api/users/profile`
  - `GET /api/users/me` (compat)
  - `POST /api/users/profile` (upsert)
  - `PUT /api/users/profile` (upsert)
  - `PATCH /api/users/profile` (partial update)
- Validation improved with strict patch schema requiring at least one field.
- Avatar flow standardized:
  - `POST /api/uploads/profile-avatar` for image upload.
  - Web settings screen can upload avatar file and persist URL in profile.
- Verified/unverified behavior parity for profile module:
  - Profile routes require authentication only.
  - `GET /users/me` now guarantees profile object (auto-create/sync from token on first call).

## Module readiness

- Web-ready:
  - Account settings supports name edit + avatar upload + preview.
  - Dashboard displays backend profile identity as source of truth.
- Mobile-ready:
  - Stable profile endpoints and request/response shapes for client reuse.
