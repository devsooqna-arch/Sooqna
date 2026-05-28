# Sooqna Website Complete Documentation

This document is the single canonical reference for the Sooqna website and its supporting backend. It explains what the product does, how the codebase is organized, how the main flows work, how to run and verify the system, and what should be improved next.

## 1. Product Summary

Sooqna is a classifieds marketplace focused on browsing, publishing, managing, and moderating listings. The web app supports public discovery, user accounts, listing submission, favorites, messaging, reviews, reports, public market insights, saved searches, price guidance, and an admin dashboard.

The active product contains:

- `apps/web`: the Next.js web application.
- `backend/sooqna-backend`: the Express REST API.
- PostgreSQL through Prisma: the source of truth for marketplace data.
- Firebase Auth: the identity provider for sign-in and ID tokens.

Firebase Auth owns authentication identity. PostgreSQL owns application identity, roles, account status, listings, categories, cities, messages, reports, reviews, moderation logs, and audit logs.

## 2. Repository Structure

```text
Sooqna/
  apps/
    web/                         Next.js frontend
  backend/
    sooqna-backend/              Express API, Prisma schema, migrations, tests
  docs/                          Current documentation
  .github/workflows/             CI and deployment workflows
  README.md                      Project entry point
```

Removed/generated items should not be committed: local logs, generated screenshots, generated reports, PDF exports, ZIP exports, `.docx`, `.xlsx`, and temporary helper tools.

## 3. System Architecture

```text
Browser
  -> Next.js app at apps/web
  -> REST API at backend/sooqna-backend under /api
  -> PostgreSQL through Prisma

Firebase Auth
  -> issues client ID tokens
  -> backend verifies tokens
  -> backend syncs or reads local User records
```

Important boundaries:

- The frontend never connects directly to PostgreSQL.
- Firebase Admin is backend-only.
- Admin role decisions come from PostgreSQL, not from client state.
- Public pages use public APIs.
- Protected user flows require a valid Firebase token and an active local account.
- Admin APIs require Firebase token, synced local user, active status, and `ADMIN` role.

## 4. Frontend Overview

The frontend is a Next.js app using the App Router.

Important folders:

- `apps/web/src/app`: route pages and app-level files.
- `apps/web/src/components`: reusable UI and feature components.
- `apps/web/src/services`: API clients and domain services.
- `apps/web/src/contexts`: auth and theme providers.
- `apps/web/src/lib`: formatting, metadata, SEO, media, and helper utilities.
- `apps/web/src/types`: shared frontend TypeScript types.

Main frontend routes:

- `/`: marketplace home.
- `/listings`: listing search and browsing.
- `/listings/[listingId]`: listing details.
- `/submit-listing`: create listing flow.
- `/my-listings`: current user's listings.
- `/my-listings/[listingId]/edit`: edit listing.
- `/favorites`: saved listings.
- `/market-insights`: public market activity and average price insights.
- `/messages`: conversations and chat.
- `/me`: account dashboard.
- `/me/settings`: profile/account settings.
- `/login`, `/register`, `/reset-password`: auth flows.
- `/categories`: category directory.
- `/admin`: admin dashboard.
- Static/support pages: `/about`, `/contact`, `/help`, `/privacy`, `/terms`, `/safety`, `/packages`, `/press`, `/careers`.

The public layout is built around `PublicShell`, public navigation actions, the search bar, admin nav state, bottom navigation, theme switching, and mobile-aware UI.

## 5. Backend Overview

The backend is an Express API mounted under `/api`.

Important folders:

- `src/app.ts`: Express app setup.
- `src/server.ts`: server startup.
- `src/routes/index.ts`: top-level API router.
- `src/config`: environment, Prisma, Firebase Admin, logging, Swagger.
- `src/middleware`: auth, role checks, validation, content filtering, error handling.
- `src/modules`: feature modules such as listings, users, admin, messages, uploads.
- `src/shared`: shared errors, contracts, validation, constants.
- `prisma/schema.prisma`: database schema.
- `prisma/migrations`: database migrations.

Top-level API modules:

- `GET /api/health`
- `/api/auth`
- `/api/uploads`
- `/api/users`
- `/api/listings`
- `/api/favorites`
- `/api/messages`
- `/api/categories`
- `/api/cities`
- `/api/engagement`
- `/api/reports`
- `/api/reviews`
- `/api/audit`
- `/api/admin`
- `/api/contact`

Most responses use:

```json
{
  "success": true,
  "data": {}
}
```

Paginated responses also include:

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

## 6. Authentication And Authorization

Authentication flow:

1. The user signs in with Firebase Auth from the web app.
2. The frontend receives a Firebase ID token.
3. Protected backend requests send that token.
4. `verifyFirebaseToken` verifies the token.
5. `authContext` loads/syncs the local user.
6. Protected routes require active account status.
7. Admin routes additionally require `Role.ADMIN`.

Local user data includes Firebase UID, email, display name, avatar, role, account status, verification fields, trust metrics, and last login timestamp.

Current roles:

- `ADMIN`: can access admin dashboard and admin APIs.
- `BUYER`: default role.
- `SELLER`: available role for future seller-specific behavior.

Best-practice rule: never trust a frontend-only role flag. UI can hide or show controls, but the backend must enforce permissions.

## 7. Database Models

Key Prisma models:

- `User`: local application user, role, account status, profile and trust metrics.
- `Listing`: marketplace listing, owner, category, city text, status, counts, lifecycle dates.
- `ListingImage`: listing image metadata and order.
- `Upload`: uploaded file metadata.
- `Favorite`: user-listing saved item.
- `Conversation`, `ConversationParticipant`, `Message`: messaging system.
- `Category`: category catalog.
- `City`: admin-managed city catalog.
- `Report`: user-submitted abuse/moderation report.
- `Review`: seller reviews and ratings.
- `SavedSearch`: user-owned saved listing search filters.
- `EngagementEvent`: analytics/event tracking.
- `ListingModerationLog`: traceable admin moderation history.
- `AuditLog`: admin and system audit trail.

Current city compatibility note:

- Listings currently store the city as `Listing.locationCity`.
- `City` exists as a dedicated admin-managed catalog.
- The recommended next improvement is a safe `cityId` migration: add nullable `Listing.cityId`, backfill from `locationCity`, dual-write both fields, move reads and filters to `cityId`, then add stronger relational constraints.

## 8. Listing Lifecycle

Listing statuses currently used by admin analytics/moderation:

- `draft`
- `pending`
- `published`
- `rejected`
- `sold`
- `archived`

Typical lifecycle:

1. User creates or edits a listing.
2. Listing is stored with owner, category, location, media, contact preference, and status.
3. Admin reviews pending/rejected listings.
4. Admin can publish, reject with reason, archive, mark sold, feature, or unfeature.
5. Moderation actions write `ListingModerationLog`.
6. Admin actions write `AuditLog`.

Rejection requires a reason. Bulk moderation actions are available and should stay capped server-side to avoid accidental large updates.

## 9. Public Website Features

Home page:

- Marketplace hero and discovery UI.
- Search by text, category, and city.
- Featured marketplace sections.

Listings:

- Public listing list and details.
- Search/filter support.
- Media rendering through backend upload URLs.
- Recently viewed and metadata helpers.

Submit listing:

- Auth-protected listing creation.
- Image upload.
- Structured payload generation.
- Category, city, condition, price, contact preference, and details.

User area:

- Account dashboard.
- Profile/settings.
- My listings.
- Favorites.
- Saved searches.
- Messages.

Engagement:

- Favorites.
- Messages and conversations.
- Reviews.
- Reports.
- Contact form.

SEO:

- `sitemap.ts`
- `robots.ts`
- `JsonLdScript`
- shared SEO helpers.

## 10. Admin Dashboard

Admin dashboard route: `/admin`.

Access requirements:

- Signed in through Firebase Auth.
- Local `User` exists.
- `accountStatus=active`.
- `role=ADMIN`.

The public header shows the dashboard link only after backend-confirmed admin status.

Admin sections:

- Overview: counts and recent audit actions.
- Analytics: KPIs, daily/weekly growth, listing status distribution, top cities, top categories, moderation SLA, top listing performance, user activity, latest activity.
- Moderation: pending/rejected queue, filters, single actions, bulk actions, history.
- Listings: listing lifecycle and feature controls.
- Users: role/status filtering, promote/demote, suspend/activate, details.
- Reports: report triage and status updates.
- Categories: category management.
- Cities: city management with active state, sort order, and listing counts.
- System Health: API, database, uploads, Firebase/Auth diagnostics.
- Audit Logs: searchable audit trail.

Important admin API endpoints:

- `GET /api/admin/stats`
- `GET /api/admin/analytics`
- `GET /api/admin/health`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/users/:id/details`
- `GET /api/admin/listings`
- `POST /api/admin/listings/:id/publish`
- `POST /api/admin/listings/:id/reject`
- `POST /api/admin/listings/:id/archive`
- `POST /api/admin/listings/:id/sold`
- `POST /api/admin/listings/:id/feature`
- `POST /api/admin/listings/:id/unfeature`
- `POST /api/admin/moderation/listings/bulk`
- `GET /api/admin/moderation/listings/:id/history`
- `GET /api/admin/cities`
- `POST /api/admin/cities`
- `PATCH /api/admin/cities/:id`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PATCH /api/admin/categories/:id`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:id`
- `GET /api/admin/audit-logs`

## 11. City Management

Cities are stored in the `City` table, not as a frontend-only array.

City fields:

- `id`
- `nameAr`
- `nameEn`
- `slug`
- `isActive`
- `sortOrder`
- `createdAt`
- `updatedAt`

Admin city management supports listing cities, adding cities, editing Arabic and English names, editing slug, activating/deactivating, controlling display order, and showing listing counts per city.

Best practice: prefer deactivation over deletion when marketplace data may reference a city.

## 12. Analytics

Admin analytics are backend-driven and not hardcoded in the frontend.

Current analytics include:

- New listings daily and weekly.
- New users daily and weekly.
- Listings grouped by status.
- Most active categories.
- Most active cities.
- Published listings / total listings conversion.
- KPI cards.
- Growth line chart.
- City/category bar chart.
- Listing status donut chart.
- Latest activities table.
- Moderation SLA: pending queue size, oldest pending listing, average decision time, and pending-age buckets.
- Top listing performance by views, favorites, or messages.
- User activity: active users, users with listings, users with messages, users with favorites.

Backend analytics should continue using aggregate queries, grouped counts, and limited result sets to avoid database overload.

### Public Market Insights

Public route:

- `/market-insights`

Public API:

- `GET /api/market/insights`

Market insights use only published, non-deleted listings and show new listings in the last 7 days, most active cities, most active categories, and average prices by category.

### Saved Searches

Saved searches let signed-in active users store listing filters and reopen them from the account dashboard.

API endpoints:

- `GET /api/saved-searches`
- `POST /api/saved-searches`
- `DELETE /api/saved-searches/:id`

Rules:

- Users can list and delete only their own saved searches.
- Query keys are sanitized server-side.
- Saved search names are limited to 80 characters.
- Supported query fields include category, city, text search, price range, condition, and sort.

### Price Insights

Price insights help sellers understand comparable pricing while creating a listing.

API endpoint:

- `GET /api/listings/price-insights?categoryId=...&city=...&condition=...`

The backend calculates sample size, average price, minimum price, maximum price, and confidence level. The submit-listing UI shows soft guidance when the entered price is outside the comparable range.

## 13. System Health

Public health endpoint:

- `GET /api/health`

Admin health endpoint:

- `GET /api/admin/health`

Admin health includes API status, database connection status, database counts, upload directory usage when available, Firebase Admin credential mode, Firebase Auth reachability, Firebase Auth user count when available, and local DB user count.

The health UI must not expose secrets, tokens, private keys, raw environment variables, or credentials.

## 14. Uploads And Media

Uploads are handled by the backend upload module and stored as metadata in the `Upload` table. Listing images are represented through `ListingImage`.

Operational rules:

- Validate file type and size server-side.
- Keep upload URLs public only when intended.
- Store file metadata, not raw files, in the database.
- Do not expose server filesystem paths to users beyond safe URL mapping.

## 15. Security Rules

Core security practices:

- Backend validates Firebase ID tokens.
- Admin endpoints require backend role checks.
- Account status is enforced server-side.
- Rejection reasons and mutable inputs should be validated.
- Secrets must never be committed.
- Admin health must hide secrets.
- Production should keep developer routes disabled.
- CORS must be restricted to the deployed frontend origin.
- Database migrations should run through Prisma migrations.
- Soft deactivation is preferred over risky deletes for users/cities.
- Audit logs and moderation logs should remain append-only for traceability.

## 16. Local Development

Requirements:

- Node.js 22
- npm
- PostgreSQL
- Firebase project for web auth

Backend setup:

```bash
cd backend/sooqna-backend
npm install
cp .env.example .env
npm run prisma:generate
npm run db:check
npm run dev
```

Backend runs at `http://localhost:5000/api`.

Web setup:

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

Web runs at `http://localhost:3000`.

Important Next.js rule:

Do not run `npm run build` while `npm run dev` is running inside `apps/web`. Both commands write to `.next`, which can cause missing chunk errors such as `Cannot find module './611.js'`. The web build includes `scripts/guard-no-next-dev.mjs` to prevent this locally.

If `.next` becomes corrupt:

```powershell
# Stop the web dev process first.
Remove-Item apps/web/.next -Recurse -Force
cd apps/web
npm run dev
```

## 17. Build, Test, And Verification

Frontend commands:

```bash
cd apps/web
npm run lint
npm run build
npm run e2e
```

Backend commands:

```bash
cd backend/sooqna-backend
npm run typecheck
npm run build
npm test
```

Before considering a change complete, verify the affected layer:

- Frontend-only change: lint/build and browser check.
- Backend-only change: typecheck/tests and API check.
- Database change: migration, Prisma generate, and relevant integration tests.
- Admin change: admin route tests plus browser check at `/admin`.

## 18. CI And Deployment

CI workflow: `.github/workflows/ci.yml`.

Typical CI checks:

- Backend install.
- Prisma generate.
- Backend typecheck.
- Backend build.
- Web install.
- Redirect validation.
- Web lint.
- Web build.

Deployment workflow: `.github/workflows/deploy.yml`.

Production backend deployment should install dependencies, generate Prisma client, build TypeScript, write backend `.env` from secrets, run `prisma migrate deploy`, run DB preflight, run idempotent seed/migration where needed, and restart the backend PM2 process.

Production web deployment should write `.env.local` from secrets, install dependencies, build Next.js, and restart the web PM2 process.

Required production configuration includes backend database URL, Firebase public web config, Firebase Admin credentials or intentional Application Default Credentials, public site URL, public API URL, upload URL settings, and CORS origin.

## 19. Environment Variables

Backend important env:

- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS`
- `CORS_ORIGIN`
- `ENABLE_CATEGORIES_JSON_FALLBACK`
- Upload/storage settings used by the upload module.

Web important env:

- `NEXT_PUBLIC_BACKEND_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- Firebase public web config values.

Rules:

- Never commit `.env` or `.env.local`.
- Keep backend secrets backend-only.
- `NEXT_PUBLIC_*` values are visible to the browser and must never contain private secrets.

## 20. Known Compatibility Notes

Current intentional compatibility points:

- `Listing.locationCity` is still used for listing-city compatibility.
- JSON fallback files exist in selected backend modules for migration/development support.
- Firebase Auth users and local DB users are different systems and may not have identical counts.
- Admin roles live in PostgreSQL.

Current local operational gotcha:

- Next.js dev and build must not run at the same time against the same `.next` directory.

## 21. Product Improvement Roadmap

Recommended next phase:

1. Complete `Listing.cityId` migration and move city filters to relational data.
2. Add richer listing quality checks before submission.
3. Improve search ranking with recency, location, category, saved searches, and engagement signals.
4. Add saved-search alerts and notification preferences.
5. Add stronger seller profiles with trust badges and listing history.
6. Add admin dashboard export/reporting tools.
7. Add stronger upload storage lifecycle cleanup.
8. Add observability: request IDs, structured production logs, and error dashboards.
9. Add more end-to-end tests for critical user journeys.

## 22. Engineering Standards

When changing the project:

- Follow the existing module boundaries.
- Add backend validation for all user input.
- Use Prisma aggregate queries for admin analytics.
- Avoid frontend hardcoded business data when the backend owns it.
- Keep admin actions traceable through logs.
- Prefer safe status changes over deletes.
- Keep UI responsive on mobile and desktop.
- Add loading, empty, and error states for async UI.
- Do not duplicate logic if a service/module already exists.
- Keep documentation current when behavior changes.

## 23. Quick Troubleshooting

`Failed to fetch` in the web app:

- Confirm backend is running at `http://localhost:5000/api`.
- Check `NEXT_PUBLIC_BACKEND_API_BASE_URL`.
- Check CORS origin.
- Open `http://localhost:5000/api/health`.

`Cannot find module './611.js'` in Next.js:

- Stop `next dev`.
- Delete `.next`.
- Start dev again.
- Do not build while dev is running.

Admin dashboard link not visible:

- Sign in.
- Confirm the local DB user exists.
- Confirm `role=ADMIN`.
- Confirm `accountStatus=active`.
- Confirm backend admin status request succeeds.

Firebase users do not match dashboard users:

- Firebase Auth shows identity-provider users.
- Dashboard users come from the local PostgreSQL `User` table.
- Users appear in the dashboard only after local sync/creation.

## 24. Ownership Summary

Use this rule to decide where a change belongs:

- Authentication identity: Firebase Auth.
- Roles and account status: backend/PostgreSQL.
- Listings, cities, categories, moderation, users, messages: backend/PostgreSQL.
- UI state and rendering: Next.js frontend.
- Admin permission enforcement: backend.
- Admin visibility and navigation: frontend, after backend confirmation.
- Generated reports/screenshots/logs: local only, not Git.
