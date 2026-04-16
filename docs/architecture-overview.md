# Architecture Overview (Separated Codebases)

## Final direction

The project is being reorganized into three separated codebases:

- `sooqna-web` (Next.js frontend)
- `sooqna-mobile` (React Native foundation)
- `sooqna-backend` (Node.js/Express API)

## Core architecture decisions

- Firebase is used only for authentication identity in web/mobile.
- Backend verifies Firebase ID tokens with Firebase Admin SDK.
- Business logic lives in backend API.
- Uploads are stored on backend server filesystem.
- No Firebase Storage in product flow.
- No Firebase Cloud Functions in product flow.
- No Firestore as primary business logic source.

## Responsibility boundaries

### Web
- UI + auth UX
- get Firebase ID token
- call backend APIs

### Mobile
- auth + app UX (future)
- get Firebase ID token
- call same backend APIs

### Backend
- token verification
- users/listings/favorites/messages business logic
- uploads and file serving
- security middleware and validation

