# Sooqna

Sooqna is a production-oriented classifieds marketplace monorepo.

The active product is:

- `apps/web` - Next.js web app
- `backend/sooqna-backend` - Express REST API
- PostgreSQL through Prisma - business data source of truth
- Firebase Auth - identity provider only

Removed or archived concepts are intentionally not kept in the repository. Generated reports, local screenshots, logs, old phase documents, ZIP exports, and temporary helper tools should stay out of Git.

## Quick Start

### Backend

```bash
cd backend/sooqna-backend
npm install
npm run prisma:generate
npm run db:check
npm run dev
```

Backend API: `http://localhost:5000/api`

### Web

```bash
cd apps/web
npm install
npm run dev
```

Web app: `http://localhost:3000`

Do not run `npm run build` while `npm run dev` is running for the web app. The build script includes a guard for this because both commands write to `.next`.

## Main Commands

```bash
# Web
cd apps/web
npm run lint
npm run build

# Backend
cd backend/sooqna-backend
npm run typecheck
npm run build
npm test
```

## Documentation

Current docs live in `docs/`:

- `docs/architecture.md`
- `docs/local-development.md`
- `docs/api-reference.md`
- `docs/admin-dashboard.md`
- `docs/deployment-operations.md`
- `docs/security.md`
- `docs/product-roadmap.md`

Start with `docs/README.md`.
