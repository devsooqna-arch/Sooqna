# Sooqna Project Structure (A to Z)

This is the current production-ready structure after cleanup and consolidation.

## Final Repository Shape

```text
Sooqna/
|-- apps/
|   |-- web/                    # Next.js frontend (Firebase Auth + backend API)
|   `-- mobile/                 # Placeholder for future React Native app
|-- backend/
|   `-- sooqna-backend/         # Single Express backend (source of truth)
|-- docs/
|   `-- project-structure-a-to-z.md
|-- .gitignore
`-- README.md
```

## Separation of Responsibilities

- `apps/web`: UI + authentication UX + API consumption
- `apps/mobile`: future mobile app, same backend contract
- `backend/sooqna-backend`: all business/data modules
- `docs`: architecture and operating documentation

## Authentication and Data Model

- Firebase Auth is kept only for identity and ID token issuance.
- Backend verifies Firebase ID token (`Authorization: Bearer ...`).
- Business data is managed by backend modules and local repositories.
- Firestore, Firebase Functions, and Firebase Storage are removed from product flow.

## Backend Structure

`backend/sooqna-backend/src`:

- `app.ts`, `server.ts`
- `config/`
- `middleware/`
- `modules/`
  - `auth`
  - `users`
  - `listings`
  - `favorites`
  - `messages`
  - `uploads`
  - `categories`
- `routes/`
- `types/`
- `utils/`

All APIs are mounted under `/api`.

## Frontend Structure

`apps/web/src`:

- `app/` (Next.js routes)
- `components/`
- `contexts/`
- `hooks/`
- `services/` (REST client layer)
- `types/`
- `lib/firebase.ts` (Auth only usage path)

## Runtime

- Web: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Active Env Files

- `apps/web/.env.example` -> copy to `apps/web/.env.local`
- `backend/sooqna-backend/.env.example` -> copy to `backend/sooqna-backend/.env`

## Removed Legacy Architecture

Removed folders/files from active architecture:

- `backend/api`
- `backend/functions`
- `sooqna-web`
- `sooqna-mobile`
- root Firebase deployment/data-flow files:
  - `firebase.json`
  - `firestore.rules`
  - `firestore.indexes.json`
  - `storage.rules`
  - `.firebaserc`


