# Phase 9: SEO, Performance, and Production Readiness

## SEO implementation

- Public indexable pages: `/`, `/listings`, `/listings/[listingId]`, `/categories`, `/about`, `/help`, `/safety`, `/privacy`, `/terms`, `/contact`.
- Protected and auth-adjacent pages are `noindex`: `/admin`, `/me`, `/me/settings`, `/favorites`, `/messages`, `/my-listings`, `/submit-listing`, `/login`, `/register`, `/reset-password`.
- Public page metadata is generated with `NEXT_PUBLIC_SITE_URL` via `apps/web/src/lib/seo.ts`.
- Metadata uses Arabic copy, `ar_SY` locale, canonical URLs, Open Graph, Twitter cards, and a safe site fallback image.

## Dynamic listing metadata

- Listing metadata is generated only from the public listing API.
- If the API returns 404 or fails, the listing detail page returns safe "not found" metadata with `noindex`.
- Metadata uses listing title, category id, city when available, a sanitized description excerpt, canonical URL, and the primary listing image when public.
- Seller email, Firebase UID, private contact data, and internal filesystem paths are not used in metadata.

## Robots policy

- `robots.ts` allows public marketplace pages and disallows protected/admin/dev areas.
- Dev pages such as `/dev-tools`, `/auth-test`, and `/listings-test` are also excluded from production route extensions.
- Static assets are not blocked.
- Robots includes the canonical sitemap URL.

## Sitemap policy

- Sitemap includes only public marketing/content pages and public listings.
- Sitemap excludes auth, dashboard, admin, protected, submit, favorite, message, and dev pages.
- Listing URLs are fetched with a bounded limit from `NEXT_PUBLIC_SITEMAP_LISTINGS_LIMIT`.
- Backend/API failures return the static sitemap instead of failing the production build.
- Listing API already filters to `published`, not deleted, and not expired listings.

## Canonical URL policy

- Public static pages use self-referencing canonical URLs.
- Listing details canonicalize to `/listings/[listingId]`.
- Search/filter/listing query parameters canonicalize to `/listings` to avoid duplicate indexation from sort, page, and filter combinations.

## Structured data

- Home page emits minimal `Organization` and `WebSite` JSON-LD with a stable `SearchAction`.
- Listing detail emits `BreadcrumbList`.
- Listing detail emits minimal `Product` JSON-LD only from public listing data.
- `Offer` is included only when the listing has a valid numeric price and the price type is not contact-only.
- Ratings/reviews are not included in schema unless a future phase adds verified aggregate schema from real data.

## Performance notes

- Listing API pagination is capped by the backend and the frontend uses a page size of 12.
- Sitemap listing fetches are bounded and timed out.
- Listing card images use stable aspect containers and lazy loading.
- Listing detail hero uses priority loading and thumbnail images are scoped to the gallery.
- Broader SSR/data-fetch architecture changes are deferred because this phase avoids marketplace rewrites.

## Image policy

- Public upload URLs should resolve through `NEXT_PUBLIC_UPLOADS_PUBLIC_BASE_URL` and backend `UPLOADS_PUBLIC_BASE_URL`.
- Production must not depend on `localhost` image URLs.
- Upload serving denies dotfiles, disables directory indexes, sends `nosniff`, and uses public cache headers.
- Do not expose local filesystem upload paths in public metadata.

## Environment checklist

Frontend production env:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_BACKEND_API_BASE_URL`
- `NEXT_PUBLIC_UPLOADS_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` when Analytics is used
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` when reCAPTCHA is enabled
- `NEXT_PUBLIC_SITEMAP_LISTINGS_LIMIT`
- `NEXT_PUBLIC_SITEMAP_FETCH_TIMEOUT_MS`

Backend production env:

- `NODE_ENV=production`
- `PORT`
- `CORS_ORIGIN`
- `TRUST_PROXY`
- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`, or `FIREBASE_SERVICE_ACCOUNT_PATH`
- `FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS=false` unless the server intentionally uses ADC
- `UPLOADS_PUBLIC_BASE_URL` or `BACKEND_PUBLIC_ORIGIN`
- `REQUIRE_EMAIL_VERIFIED=true`
- `RECAPTCHA_ENABLED` and `RECAPTCHA_SECRET_KEY` when enabled
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` when contact email is enabled
- `MODERATION_BLOCKED_KEYWORDS`
- `LISTING_DEFAULT_EXPIRY_DAYS`
- `LISTING_RENEW_DAYS`

## Deploy checklist

- Domain DNS points to production server.
- SSL certificate is active and auto-renewing.
- Reverse proxy routes `/` to `sooqna-web` and `/api`, `/uploads` to `sooqna-backend`.
- `CORS_ORIGIN` exactly matches the public site origin.
- Firebase Authorized Domains include the production domain.
- GitHub secrets are set for deploy host/user/key/path and runtime env.
- Local branch is pushed; deploy resets the server to `origin/main`.
- CI passes before deploy.
- Deploy runs `prisma migrate deploy` before PM2 reload.
- PM2 has `sooqna-backend` and `sooqna-web`.
- `/api/health`, `/robots.txt`, and `/sitemap.xml` return successful responses.
- Admin account is provisioned deliberately.
- Dev routes and API docs are not exposed in production.
- Rate limits and email verification are enabled.
- Contact email provider is configured if the contact form should send mail.

## Prisma migration checklist

- Commit every migration directory under `backend/sooqna-backend/prisma/migrations`.
- Run `npm run prisma:generate` before build.
- Run `npx prisma migrate deploy` in production, not `prisma migrate dev`.
- Run `npm run db:check` after migrations.
- Back up the database before any production migration.
- Rollback plan is restore-from-backup plus redeploy the previous known-good commit.

## Logging and monitoring

- Backend production logs are JSON lines from `logger`.
- Error responses avoid stack traces and secret values.
- PM2 logs should be reviewed with `pm2 logs sooqna-backend` and `pm2 logs sooqna-web`.
- Add uptime monitoring for `/api/health` and the home page.
- Add error tracking only after choosing a provider and confirming no secret/user-private payload leakage.

## Backup and restore

Database backup example:

```bash
pg_dump "$DATABASE_URL" --format=custom --file="sooqna-$(date +%F-%H%M).dump"
```

Restore example:

```bash
pg_restore --clean --if-exists --dbname "$DATABASE_URL" sooqna-YYYY-MM-DD-HHMM.dump
```

Operational policy:

- Take an on-demand backup before every production migration/deploy.
- Schedule at least daily PostgreSQL backups.
- Store backups outside the application server with restricted access.
- Periodically test restore into a staging database.
- If local uploads are used, back up `backend/sooqna-backend/uploads` with the same retention policy as the database.

## Remaining risks

- Listing pages still render most detail UI client-side after server metadata fetch.
- Next image optimization is disabled for listing images; a future image pipeline/CDN can improve bandwidth.
- The deploy workflow assumes a single-server PM2 model.
- Tracked historical logs/zips should be removed in a separate cleanup if they contain no needed evidence and no secrets.
