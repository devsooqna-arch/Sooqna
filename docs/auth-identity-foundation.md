# Sooqna Auth & Identity Foundation

## Architecture

Sooqna uses Firebase Authentication only for sign-in, registration, password reset, email verification, and Google sign-in. Marketplace authorization is enforced by the backend.

Flow:

1. The web app signs the user in with Firebase Auth.
2. The web app sends the Firebase ID token in `Authorization: Bearer <token>`.
3. The backend verifies the token with Firebase Admin.
4. The backend syncs or loads `User` from PostgreSQL by `User.firebaseUid`.
5. Protected business routes use `req.currentUser`, not user IDs or roles sent by the frontend.

## PostgreSQL User

`User.firebaseUid` links Firebase Auth to business data. `User.role` and `User.accountStatus` are backend-owned fields. The frontend may display role/status returned by the backend, but it never decides access.

Supported roles:

- `ADMIN`
- `BUYER`
- `SELLER`

Supported account statuses:

- `active`
- `suspended`
- `deleted`

Only `active` users may perform protected business actions.

## Firebase Admin Credentials

Production must use one explicit credential mode:

1. `FIREBASE_SERVICE_ACCOUNT_PATH`
2. `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`
3. Application Default Credentials with `FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS=true`

Do not log credential values. If using `FIREBASE_PRIVATE_KEY` in `.env`, store escaped newlines as `\n`.

Required backend auth env vars:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS`
- `REQUIRE_EMAIL_VERIFIED`

## Email Verification Policy

Authenticated but unverified users may access session/profile hydration routes:

- `GET /api/auth/session`
- `GET /api/users/me`
- `POST /api/users/profile`

Verified email is required for:

- creating or changing listings
- publishing/unpublishing/renewing/expiring/deleting listings
- attaching listing images
- uploading listing images
- uploading profile avatars
- favorites
- messages
- reports

This is enforced in backend middleware, not only in the UI.

## Admin Policy

Admin routes require:

- valid Firebase token
- PostgreSQL user context
- `accountStatus === "active"`
- `User.role === "ADMIN"`

Admin-only routes include:

- `GET /api/audit/logs`
- `GET /api/reports/queue`
- `PATCH /api/reports/:id`

## Google Sign-In

Google sign-in remains enabled in the frontend. Firebase Console must have:

- Google provider enabled
- local and production domains added to Authorized domains
- matching `NEXT_PUBLIC_FIREBASE_*` values in the web environment

## Common Errors

- `UNAUTHORIZED`: missing/invalid Firebase ID token.
- `USER_CONTEXT_UNAVAILABLE`: token verified, but PostgreSQL user sync/load failed.
- `ACCOUNT_NOT_ACTIVE`: user exists but status is not `active`.
- `EMAIL_NOT_VERIFIED`: user must verify email before this action.
- `FORBIDDEN`: authenticated user does not have required role or ownership.
