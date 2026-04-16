# Backend Architecture (Post-Migration)

## Why this migration

The platform now uses:

- Firebase Authentication only (identity provider)
- Custom backend API (Express + TypeScript) as the business logic source of truth
- Local file storage on VPS server (no Firebase Storage)
- No Firebase Cloud Functions for business logic

This enables full backend ownership, server-side validation, and easier migration to SQL/NoSQL databases later.

## High-level flow

1. User signs in from frontend using Firebase Auth.
2. Frontend gets Firebase ID token.
3. Frontend calls backend with `Authorization: Bearer <idToken>`.
4. Backend verifies token using Firebase Admin SDK.
5. Backend executes business logic (users, listings, favorites, messages, uploads).
6. Uploaded files are stored on server filesystem and served from `/uploads`.

## Current backend stack

- Node.js + Express
- TypeScript
- Firebase Admin SDK (token verification only)
- multer (uploads)
- helmet, cors, express-rate-limit
- morgan, dotenv

## Current folder design

`backend/api/src` is split into:

- `config` (env, firebase admin setup)
- `middleware` (token verification, error handling)
- `modules` (auth, uploads, users, listings, favorites, messages)
- `routes` (module registration)
- `utils` (time, ids, file persistence helpers)
- `types` (express typing augmentation)

Each module follows:
- `routes` -> `controller` -> `service` -> `repository`

Repositories are file-based now and can be replaced later with database adapters.

## Security approach

- Firebase ID token verification middleware for protected routes
- Helmet for secure headers
- API rate limiting
- Upload MIME restrictions (jpg/jpeg/png/webp)
- Upload size limit (5MB)
- Owner checks for protected listing operations
- Configurable CORS origin

## Deployment model (VPS/Plesk)

- Build TS to `dist`
- Run with Node process manager (PM2 or Plesk Node app)
- Reverse proxy Nginx/Apache to API port
- Serve `/uploads` as static files from backend app
- Use env vars for Firebase Admin credentials

