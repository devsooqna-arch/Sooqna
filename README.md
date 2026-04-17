# Sooqna

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)

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

## Continuous Integration

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Triggered on:
  - Pull requests to `master`
  - Pushes to `master`
- CI checks:
  - Backend: install, `typecheck`, `build`
  - Web: install, `lint`, `build`

> Update the badge link by replacing `OWNER/REPO` with your GitHub repository path.

## Deployment (After CI)

- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Trigger: automatically after CI finishes successfully on branch `master`
- Target domain: `https://UN.flashpointjordan.com`
- Deploy target: same server for backend + web via SSH

### Required GitHub Secrets

Set these repository secrets before enabling deployment:

- `DEPLOY_HOST`: production server host/IP
- `DEPLOY_PORT`: SSH port (usually `22`)
- `DEPLOY_USER`: SSH username
- `DEPLOY_SSH_KEY`: private key for deploy user
- `DEPLOY_APP_DIR`: absolute path of project on server (example: `/var/www/sooqna`)

### Server Runtime Assumptions

Current workflow assumes:

- Node.js and npm installed on server
- PM2 installed globally
- backend process name: `sooqna-backend`
- web process name: `sooqna-web`
- backend exposed behind reverse proxy at `/api`
- web served from same domain host

### Production Server Readiness Checklist

Run these checks on the production server before first deployment:

1) Operating user + project path

- Verify deploy user can access project directory:
  - `ls -la <DEPLOY_APP_DIR>`
- Verify repo is cloned in that same path.

2) Node.js + npm versions

- `node -v` (recommended: v22.x)
- `npm -v`

3) PM2 availability

- `pm2 -v`
- If missing: `npm i -g pm2`

4) Backend env file exists

- Path: `backend/sooqna-backend/.env`
- Must include at least:
  - `PORT`
  - `DATABASE_URL`
  - `CORS_ORIGIN`
  - Firebase admin credentials
  - `UPLOADS_PUBLIC_BASE_URL`

5) Web env file exists

- Path: `apps/web/.env.local`
- Must include required web runtime vars (API base URL, Firebase client config, etc.).

6) Database connectivity

- From `backend/sooqna-backend`:
  - `npm run prisma:generate`
  - `npm run prisma:migrate`
- Confirm migration command succeeds with no connection errors.

7) PM2 process bootstrap (one-time)

- Backend:
  - `cd backend/sooqna-backend`
  - `npm ci && npm run build`
  - `pm2 start dist/server.js --name sooqna-backend`
- Web:
  - `cd apps/web`
  - `npm ci && npm run build`
  - `pm2 start "npm run start -- -p 3000" --name sooqna-web`

8) Reverse proxy (Nginx or equivalent)

- Domain: `UN.flashpointjordan.com`
- Route `/api/*` -> backend service port
- Route `/` -> web service port
- Ensure HTTPS certificate is active.

9) Health checks

- Backend:
  - `curl -I https://UN.flashpointjordan.com/api/health`
- Web:
  - `curl -I https://UN.flashpointjordan.com`

10) GitHub secrets validation

- Ensure these repository secrets are set correctly:
  - `DEPLOY_HOST`
  - `DEPLOY_PORT`
  - `DEPLOY_USER`
  - `DEPLOY_SSH_KEY`
  - `DEPLOY_APP_DIR`

11) Final dry-run

- Push a small commit to `master`.
- Confirm `CI` passes first.
- Confirm `Deploy` runs automatically after CI success.
- Confirm PM2 processes are healthy:
  - `pm2 status`

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

