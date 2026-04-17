# Sooqna Technical Documentation (A to Z)

Single-source documentation for folder structure, backend architecture, API modules, and database design.

## 1) System Overview

Sooqna is organized as a monorepo:

- Web client in `apps/web` (Next.js).
- Mobile placeholder in `apps/mobile`.
- Main backend API in `backend/sooqna-backend` (Express + TypeScript + Prisma + PostgreSQL).
- Project documentation in `docs`.

Authentication is done with Firebase Auth tokens, while business data is owned by the backend and stored in PostgreSQL.

---

## 2) Folder Structure (A to Z)

### 2.1 Repository Root

```text
Sooqna/
|-- apps/
|   |-- mobile/                          # Future mobile app placeholder
|   `-- web/                             # Next.js frontend app
|-- backend/
|   `-- sooqna-backend/                  # Main production backend API
|-- docs/
|   `-- project-structure-a-to-z.md      # This file
|-- sooqna-backend/                      # Empty root-level folder (currently unused)
|-- .gitignore
|-- README.md
|-- firebase.docx
`-- Project_Accounts.xlsx
```

### 2.2 Frontend Structure (`apps/web`)

```text
apps/web/
|-- package.json
|-- src/
|   |-- app/                             # Next.js App Router pages and layouts
|   |-- components/                      # Reusable UI components
|   |-- contexts/                        # React context providers
|   |-- hooks/                           # Custom React hooks
|   |-- lib/                             # Shared utilities (includes Firebase client setup)
|   |-- services/                        # API client layer for backend calls
|   `-- types/                           # Shared frontend TypeScript types
```

### 2.3 Backend Structure (`backend/sooqna-backend`)

```text
backend/sooqna-backend/
|-- data/                                # Data/support files (project-specific)
|-- prisma/
|   |-- schema.prisma                    # Prisma data model (source of truth)
|   `-- migrations/
|       |-- 0001_init_postgres/
|       |   `-- migration.sql            # Initial DB DDL
|       `-- migration_lock.toml
|-- scripts/
|   `-- migrate-json-to-db.ts            # One-time/utility migration script
|-- src/
|   |-- app.ts                           # Express app setup (middleware + route mounting)
|   |-- server.ts                        # Server bootstrap (listen on port)
|   |-- config/                          # Env, Prisma, Firebase admin config
|   |-- middleware/                      # Error handling, auth verification, etc.
|   |-- modules/                         # Feature modules
|   |   |-- auth/
|   |   |-- users/
|   |   |-- listings/
|   |   |-- favorites/
|   |   |-- messages/
|   |   |-- uploads/
|   |   `-- categories/
|   |-- routes/                          # Shared/aggregate route files
|   |-- shared/
|   |-- types/
|   `-- utils/
|-- uploads/                             # Public uploaded files served statically
|-- .env.example
|-- package.json
`-- tsconfig.json
```

### 2.4 Backend Modules Layout

Each business module generally follows this pattern:

- `*.routes.ts` -> route definitions.
- `*.controller.ts` -> HTTP handlers.
- `*.service.ts` -> business logic.
- `repositories/` or `*.repository.ts` -> DB/data access.
- `*.types.ts` -> module-specific types.

Current module inventory:

- `auth`: `auth.routes.ts`
- `users`: routes, controller, service, types, repositories
- `listings`: routes, controller, service, types, repositories
- `favorites`: routes, controller, service, types, repositories
- `messages`: routes, controller, service, types, repositories
- `uploads`: routes, controller, config, repository
- `categories`: repository + route export (main implementation in `src/routes/categories.ts`)

---

## 3) Backend Architecture

### 3.1 Runtime and Framework

- Node.js + Express 4 + TypeScript.
- App entry:
  - `src/server.ts` starts server.
  - `src/app.ts` configures middleware and routes.

### 3.2 Global Middleware Pipeline

Configured in `src/app.ts`:

- `helmet` for security headers.
- `cors` with configured allowed origin.
- `express.json` body parser (`1mb` limit).
- `morgan` request logging.
- `express-rate-limit` on `/api`:
  - window: 15 minutes
  - max: 500 requests per window.
- Static file hosting: `/uploads` mapped to local `uploads` directory.
- Final handlers:
  - not found middleware
  - centralized error handler

### 3.3 Authentication Model

- Identity provider: Firebase Auth.
- Backend token verification: `verifyFirebaseToken` middleware.
- Typical protected routes expect:
  - `Authorization: Bearer <firebase-id-token>`
- Backend uses verified token claims and user uid for authorization checks.

---

## 4) API Documentation

Base URL (local): `http://localhost:5000/api`

### 4.1 Router Mounting

Defined in `src/routes/index.ts`:

- `/health`
- `/auth`
- `/uploads`
- `/users`
- `/listings`
- `/favorites`
- `/messages`
- `/categories`

### 4.2 Endpoints by Module

#### Health

- `GET /api/health`
  - Public.
  - Returns service status and uptime.

#### Auth

- `GET /api/auth/session`
  - Protected (`verifyFirebaseToken`).
  - Returns current authenticated user session identity fields.

#### Users

- `POST /api/users/profile`
  - Protected.
  - Creates or updates current user profile.
- `GET /api/users/me`
  - Protected.
  - Returns current user profile data.

#### Listings

- `GET /api/listings`
  - Public.
  - List/query listings.
- `GET /api/listings/:id`
  - Public.
  - Get listing details by id.
- `POST /api/listings`
  - Protected.
  - Create new listing.
- `PATCH /api/listings/:id`
  - Protected.
  - Partial update listing.
- `DELETE /api/listings/:id`
  - Protected.
  - Delete listing.
- `POST /api/listings/:id/images`
  - Protected.
  - Attach uploaded image to listing.

#### Favorites

Router-level auth is applied to all favorites routes.

- `POST /api/favorites/:listingId`
  - Protected.
  - Add listing to current user favorites.
- `DELETE /api/favorites/:listingId`
  - Protected.
  - Remove listing from current user favorites.
- `GET /api/favorites`
  - Protected.
  - List current user favorites.

#### Messages

- `POST /api/messages/conversations`
  - Protected.
  - Create a conversation.
- `POST /api/messages/conversations/:conversationId/messages`
  - Protected.
  - Send a message in a conversation.
- `GET /api/messages/conversations/:conversationId`
  - Currently mounted without route-level `verifyFirebaseToken`.
- `GET /api/messages/conversations/:conversationId/messages`
  - Currently mounted without route-level `verifyFirebaseToken`.

Note: Route-level protection for the two `GET` endpoints should be reviewed to ensure intended access policy.

#### Uploads

- `POST /api/uploads/listing-image`
  - Protected.
  - Multipart upload (`image` field).
  - Stores file metadata and returns uploaded asset information.

#### Categories

- `GET /api/categories`
  - Public.
  - Query option: `activeOnly` (default true).
  - Uses Prisma repository.
  - In non-production, if DB is empty, categories can be seeded from local JSON.
  - If DB is unavailable in dev, endpoint can fallback to local JSON file.

---

## 5) Database Documentation

### 5.1 Stack

- Database: PostgreSQL.
- ORM: Prisma.
- Prisma schema: `prisma/schema.prisma`.
- Migration history: `prisma/migrations`.

### 5.2 Core Tables / Models

#### `User`

- Stores application user profile linked to Firebase identity.
- Key fields:
  - `id` (PK)
  - `firebaseUid` (unique identity link)
  - profile and account fields
- Relations:
  - one-to-many with `Listing`
  - one-to-many with `Favorite`

#### `Listing`

- Main marketplace item.
- Key fields:
  - textual details, pricing, location, status, counters, timestamps
  - `ownerId` references `User.firebaseUid` (nullable)
- Relations:
  - one-to-many `ListingImage`
  - one-to-many `Favorite`
  - one-to-many `Upload`

#### `ListingImage`

- Stores listing image records.
- FK: `listingId -> Listing.id` (`ON DELETE CASCADE`).

#### `Favorite`

- User-to-listing bookmark relation.
- FKs:
  - `userId -> User.firebaseUid`
  - `listingId -> Listing.id` (nullable in schema)
- Unique constraint on (`userId`, `listingId`).

#### `Conversation`

- Messaging thread metadata, listing snapshot, last message info.
- Relations:
  - one-to-many `ConversationParticipant`
  - one-to-many `Message`

#### `ConversationParticipant`

- Participant records per conversation.
- FK: `conversationId -> Conversation.id`.
- Unique (`conversationId`, `userId`).

#### `Message`

- Messages inside a conversation.
- FK: `conversationId -> Conversation.id` (`ON DELETE CASCADE`).
- `attachments` stored as JSON.

#### `Category`

- Category taxonomy.
- Includes localized names, slug, active flag, and sort order.

#### `Upload`

- Uploaded file metadata.
- Prisma relation: optional `listingId -> Listing.id` (`SetNull` in schema relation).

### 5.3 Key Relationship Summary

- `User` 1..N `Listing`
- `User` 1..N `Favorite`
- `Listing` 1..N `ListingImage`
- `Listing` 1..N `Favorite`
- `Listing` 1..N `Upload`
- `Conversation` 1..N `ConversationParticipant`
- `Conversation` 1..N `Message`

### 5.4 Schema vs Migration Notes

There are important differences to track:

- `User.avatarUrl`:
  - Prisma schema: nullable (`String?`)
  - Initial migration SQL: `NOT NULL`
- `Upload.listingId`:
  - Prisma schema: nullable + `SetNull`
  - Initial migration SQL: `NOT NULL` + `ON DELETE CASCADE`

Recommendation: align Prisma schema and migration state in the next DB maintenance cycle.

---

## 6) Environment and Local Run

### 6.1 Environment Files

- Web:
  - copy `apps/web/.env.example` -> `apps/web/.env.local`
- Backend:
  - copy `backend/sooqna-backend/.env.example` -> `backend/sooqna-backend/.env`

### 6.2 Backend Commands

From `backend/sooqna-backend`:

- `npm run dev` -> start development server
- `npm run build` -> compile TypeScript
- `npm start` -> run compiled build
- `npm run prisma:generate` -> generate Prisma client
- `npm run prisma:migrate` -> run Prisma migration in dev
- `npm run db:migrate-json` -> run JSON-to-DB migration utility script

### 6.3 Web Commands

From `apps/web`:

- `npm run dev` -> start Next.js dev server
- `npm run build` -> production build
- `npm start` -> run production server

### 6.4 Local URLs

- Web app: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

---

## 7) Legacy/Removed Architecture Notes

Per repository cleanup notes, these are removed from active architecture:

- `backend/api`
- `backend/functions`
- `sooqna-web`
- `sooqna-mobile`
- Legacy Firebase deployment/data-flow files at root (if reintroduced, they are not part of current production flow unless explicitly documented).


