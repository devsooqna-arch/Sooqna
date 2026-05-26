# Phase 8 — Security & Abuse Prevention

## Security Model

Sooqna uses Firebase Auth for identity proof and the PostgreSQL `User` record as the authorization source of truth. Backend routes must not trust frontend role, status, owner, sender, or moderation fields.

## Auth And Authorization

- Firebase ID tokens are verified by `verifyFirebaseToken`.
- `requireCurrentUser` loads or syncs the PostgreSQL user.
- `requireActiveUser` blocks `suspended` and `deleted` users from business actions.
- `checkRole([Role.ADMIN])` protects admin and audit routes.
- `requireVerifiedEmail` protects listing, upload, favorite, message, report, and engagement writes when `REQUIRE_EMAIL_VERIFIED=true`.

## Role And Status Policy

- Normal users cannot access `/api/admin/*` or `/api/audit/logs`.
- Suspended/deleted users cannot create listings, upload, favorite, message, report, or update profile data.
- Role and account status changes are only allowed through admin routes and are audit logged.

## Rate Limit Policy

- `/api` has a global fallback limiter.
- Auth routes have tighter limits, including resend verification and reCAPTCHA verification.
- Write-heavy routes such as listings and uploads have a short-window limiter.
- Contact and reports are separately limited to reduce spam.
- Admin routes are authenticated and role-protected before business logic, with an additional limiter.
- If deployed behind a reverse proxy, set `TRUST_PROXY=1` or the exact trusted proxy setting for the hosting topology.

## Upload Policy

- Listing images and profile avatars require auth, active status, and verified email.
- Allowed formats are JPEG, PNG, and WEBP only.
- Uploads enforce MIME type, extension, file size, randomized filename, and magic-byte validation.
- SVG and executable uploads are not allowed.
- Listing image attachment must reference an upload path and URL owned by the authenticated user.
- A listing can have at most 10 images.
- `/uploads` is served as static files with `X-Content-Type-Options: nosniff`, no directory index, and dotfiles denied.

## CORS Policy

- Production requires `CORS_ORIGIN`.
- `CORS_ORIGIN` supports comma-separated allowed origins.
- Wildcard production CORS is not used.
- Requests without an Origin header are allowed for server-to-server and health checks.

## Dev Endpoint Policy

- `/api/health` remains public and exposes only a minimal status and uptime.
- `/api/dev/*` is mounted only outside production.
- `/api/docs` is mounted only outside production.
- Frontend `.dev.tsx` pages are included only in development through `pageExtensions`.

## Public Data Exposure

- Public listing serialization removes moderation-only fields and uploaded file storage paths.
- Public seller data should stay limited to display name, public avatar, member-since/trust stats, and public verification flags.
- Reports, audit logs, emails, provider details, and backend-only metadata remain admin-only or authenticated-only.

## Error Handling And Logging

- `sendError` omits `details` in production responses.
- Firebase token verification failures log only a safe reason name.
- reCAPTCHA failures do not return upstream error details to clients.
- Contact provider errors return generic Arabic-friendly messages.

## Environment Checklist

- Backend secrets stay only in backend env: `DATABASE_URL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `RECAPTCHA_SECRET_KEY`, `RESEND_API_KEY`.
- Do not put backend secrets in `NEXT_PUBLIC_*`.
- Production must set `NODE_ENV=production`, `CORS_ORIGIN`, `DATABASE_URL`, Firebase Admin credentials, and HTTPS upload/public origins.
- If `RECAPTCHA_ENABLED=true` in production, `RECAPTCHA_SECRET_KEY` is required.

## Known Limitations

- This phase does not add AI moderation, payment risk tooling, device fingerprinting, or a dedicated abuse queue beyond existing report/audit hooks.
- Public seller identifiers are still used where current messaging/review flows require them; a future phase can replace them with opaque public seller IDs.
- Contact form CAPTCHA is ready at the auth/recaptcha layer but is not fully wired into the public contact UI.

## Recommended Future Improvements

- Add duplicate report suppression by reporter and target.
- Add opaque public seller IDs.
- Add optional image normalization/metadata stripping with `sharp`.
- Add a dedicated security event stream for repeated blocked uploads, reports, and message spam.
