# Security

## Authentication

Firebase Auth issues ID tokens. The backend verifies tokens with Firebase Admin.

## Authorization

Backend authorization is enforced with:

- `verifyFirebaseToken`
- `requireCurrentUser`
- `requireActiveUser`
- `checkRole`

Admin routes require `Role.ADMIN`.

## Secrets

Do not commit:

- `.env`
- Firebase private keys
- service account JSON
- database URLs
- deployment SSH keys
- API provider secrets

Health endpoints must never expose private values.

## Rate Limits

The API applies route-level rate limits for:

- general `/api`
- auth routes
- reports
- messages
- favorites
- listings
- uploads/listing writes
- admin routes
- contact form

## Uploads

Uploads are served from `/uploads` with:

- no directory index
- dotfiles denied
- `X-Content-Type-Options: nosniff`
- public cache headers

Keep upload validation strict and do not trust client MIME types alone.

## Admin Auditability

Admin and moderation actions should be traceable through:

- `AuditLog`
- `ListingModerationLog`

Reject actions require a reason.
