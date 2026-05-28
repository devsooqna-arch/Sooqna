# Deployment And Operations

## CI

Workflow: `.github/workflows/ci.yml`

Checks:

- Backend install, Prisma generate, typecheck, build.
- Web install, redirect validation, lint, build.

## Deploy

Workflow: `.github/workflows/deploy.yml`

Deployment runs after CI succeeds on `main`.

Required secrets include:

- SSH deployment secrets.
- Backend database URL.
- Firebase public web config.
- Firebase Admin credentials or intentional Application Default Credentials.
- Public site/API/upload URLs.

## Backend Deployment

Production backend steps:

1. Install dependencies.
2. Generate Prisma client.
3. Build TypeScript.
4. Write backend `.env` from GitHub secrets.
5. Run `prisma migrate deploy`.
6. Run DB preflight.
7. Run idempotent JSON seed/migration.
8. Restart PM2 process `sooqna-backend`.

## Web Deployment

Production web steps:

1. Write `.env.local` from GitHub secrets.
2. Install dependencies.
3. Build Next.js.
4. Restart PM2 process `sooqna-web`.

## Health Checks

- Public backend: `GET /api/health`
- Admin health: `GET /api/admin/health`

Admin health includes database counts and Firebase/Auth sync diagnostics.

## Operational Rules

- Never commit `.env`, logs, generated screenshots, PDFs, ZIP exports, or local reports.
- Never run Next dev and Next build against the same `.next` directory at the same time.
- Run database migrations through Prisma migrations, not manual production edits.
- Keep `ENABLE_CATEGORIES_JSON_FALLBACK=false` in local and production unless temporarily debugging.
