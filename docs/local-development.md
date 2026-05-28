# Local Development

## Requirements

- Node.js 22
- npm
- PostgreSQL
- Firebase project for web auth

## Backend Setup

```bash
cd backend/sooqna-backend
npm install
cp .env.example .env
npm run prisma:generate
npm run db:check
npm run dev
```

Backend runs on `http://localhost:5000/api`.

Required backend env:

- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- Firebase Admin credentials for production-like Admin SDK checks
- `CORS_ORIGIN=http://localhost:3000`
- `ENABLE_CATEGORIES_JSON_FALLBACK=false`

## Web Setup

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

Web runs on `http://localhost:3000`.

Required web env:

- `NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:5000/api`
- Firebase public web config
- `NEXT_PUBLIC_SITE_URL`

## Build Checks

```bash
cd apps/web
npm run lint
npm run build

cd ../../backend/sooqna-backend
npm run typecheck
npm test
```

## Next.js Cache Rule

Do not run `npm run build` while `npm run dev` is running in `apps/web`. Both commands write to `.next`, which can produce missing chunk errors such as `Cannot find module './611.js'`.

The web build includes `scripts/guard-no-next-dev.mjs` to stop this mistake locally on Windows.

If the local dev cache becomes corrupt:

```powershell
# Stop the web dev process first.
Remove-Item apps/web/.next -Recurse -Force
cd apps/web
npm run dev
```
