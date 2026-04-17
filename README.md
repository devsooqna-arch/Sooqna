# Sooqna

Production-focused monorepo with strict separation:

- `apps/web` -> Next.js frontend (UI + Firebase Auth only)
- `apps/mobile` -> mobile placeholder (future app)
- `backend/sooqna-backend` -> Express API (single source of truth for business data)
- `docs` -> architecture and project structure docs

## Architecture Summary

- Frontend and mobile clients consume backend REST APIs.
- Firebase is used for authentication only (ID token issuance).
- Backend verifies Firebase ID tokens using Firebase Admin.
- Product data no longer relies on Firestore, Cloud Functions, or Firebase Storage.

## Run Locally

### 1) Backend

```bash
cd backend/sooqna-backend
npm install
npm run dev
```

Backend base URL: `http://localhost:5000/api`

### 2) Web

```bash
cd apps/web
npm install
npm run dev
```

Web URL: `http://localhost:3000`

## Environment Files

- Web: `apps/web/.env.example` (copy to `apps/web/.env.local`)
- Backend: `backend/sooqna-backend/.env.example` (copy to `backend/sooqna-backend/.env`)

## Active API Modules

Inside `backend/sooqna-backend/src/modules`:

- `auth`
- `users`
- `listings`
- `favorites`
- `messages`
- `uploads`
- `categories`

All routes are mounted under `/api`.

## Cleanup Notes

Removed from active architecture:

- `backend/api`
- `backend/functions`
- `sooqna-web`
- `sooqna-mobile`
- root Firebase product-flow files (`firebase.json`, Firestore/Storage rules)

