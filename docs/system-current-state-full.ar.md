# Sooqna — التوثيق الكامل للحالة الحالية (AS-IS)

آخر تحديث: 2026-04-28  
هذا الملف يوثّق **ما هو موجود فعليًا الآن** في الكود الحالي، بدون تحويله إلى best-practice plan.

---

## 1) نظرة عامة على المشروع الحالي

المشروع Monorepo ويحتوي فعليًا على:

- `apps/web`: تطبيق الويب (Next.js 15 + React 19 + Firebase client auth).
- `apps/mobile`: موجود كـ placeholder (README فقط).
- `backend/sooqna-backend`: API رئيسي (Express + TypeScript + Prisma + PostgreSQL).
- `docs`: توثيقات وتشغيل وملاحظات.
- `.github/workflows`: CI + Deploy.

---

## 2) الوضع الحالي للويب (`apps/web`)

## 2.1 التقنية المستخدمة فعليًا

- Next.js `^15.3.0`
- React / React DOM `^19.1.0`
- Firebase SDK `^11.6.0`
- TailwindCSS + PostCSS + ESLint + TypeScript

## 2.2 Scripts الحالية

- `npm run dev` -> تشغيل تطوير.
- `npm run validate:redirects` -> فحص ملف تحويلات WordPress.
- `npm run build` -> `validate:redirects` ثم build.
- `npm run start` -> تشغيل production server.
- `npm run lint` -> ESLint على المشروع.

## 2.3 صفحات App Router الموجودة فعليًا

المسارات الموجودة حاليًا في `src/app`:

- `/`
- `/about`
- `/auth-test`
- `/categories`
- `/contact`
- `/dev-tools`
- `/favorites`
- `/listings`
- `/listings/[listingId]`
- `/listings-test`
- `/login`
- `/messages`
- `/me`
- `/me/settings`
- `/my-listings`
- `/my-listings/[listingId]/edit`
- `/register`
- `/reset-password`
- `/submit-listing`
- `/terms`

## 2.4 مكونات واجهة موجودة فعليًا (مختصر)

ضمن `src/components` توجد مكونات فعلية لتغطية:

- Auth: `LoginForm`, `ResetPasswordForm`, `AuthPageShell`, `RequireAuthGate`.
- Layout: `PublicShell`, `SearchBar`, `PublicNavActions`, `ThemeSwitcher`, `BottomNav`.
- Listings: `PublicListingsPage`, `ListingCard`, `ListingDetailsView`, `SubmitListingPage`, `EditListingPageView`, `MyListingsPageView`.
- Messages: `MessagesWorkspace`.
- Favorites/Categories/Account: صفحات عرض وإدارة.
- UI: `ModernAvatar` (مضاف ومستخدم في عدة مناطق).

## 2.5 حالة التصميم الحالية

- الألوان والخطوط والـ RTL معرفة global في `src/app/globals.css`.
- خط Cairo مفعل global.
- ثيمات موجودة: `classic` / `light` / `dark`.
- reusable UI classes موجودة (مثل `ui-card`, `ui-btn-primary`, `ui-input`, `ui-select`).
- في `SearchBar` تم تحويل dropdowns الرئيسية إلى custom dropdown component بدل native select.

---

## 3) الوضع الحالي للباكند (`backend/sooqna-backend`)

## 3.1 التقنية المستخدمة فعليًا

- Express `^4.21.2`
- Prisma `^7.7.0` + `@prisma/client`
- PostgreSQL driver `pg`
- Firebase Admin
- Zod
- Multer
- Helmet / CORS / Morgan / express-rate-limit

## 3.2 Scripts الحالية

- `npm run dev` -> يشغّل `dev:strict`.
- `npm run dev:strict` -> `db:check` ثم `dev:server`.
- `npm run dev:server` -> `ts-node-dev`.
- `npm run typecheck`
- `npm run build`
- `npm run start`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`
- `npm run db:check`
- `npm run db:migrate-json`

## 3.3 Middleware/Server pipeline الحالي (`src/app.ts`)

الموجود فعليًا:

- `helmet`
- `cors` باستخدام `env.corsOrigin`
- `express.json({ limit: "1mb" })`
- `morgan`
- Rate limits:
  - `/api` عام: 500/15min
  - `/api/auth`: 20/15min
  - `/api/reports`: 40/15min
  - `/api/messages`: 120/5min
  - `/api/favorites`: 120/5min
- static uploads: `/uploads`
- not found handler + error handler

## 3.4 المتغيرات البيئية المعتمدة فعليًا (`src/config/env.ts`)

المتغيرات المستخدمة فعليًا:

- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN`
- `UPLOADS_PUBLIC_BASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `RECAPTCHA_ENABLED`
- `RECAPTCHA_SECRET_KEY`
- `REQUIRE_EMAIL_VERIFIED`
- `ADMIN_UIDS`
- `MODERATION_BLOCKED_KEYWORDS`
- `LISTING_DEFAULT_EXPIRY_DAYS`
- `LISTING_RENEW_DAYS`
- `DATABASE_URL`
- `ENABLE_CATEGORIES_JSON_FALLBACK`

ملاحظة سلوك فعلي:

- إذا `DATABASE_URL` غير موجود وكان `ENABLE_CATEGORIES_JSON_FALLBACK=false` -> التطبيق يرمي خطأ عند startup.

---

## 4) API الفعلية الحالية (حسب Routes)

Base prefix: `/api`

## 4.1 Root API routes (`src/routes/index.ts`)

- `GET /api/health`
- `GET /api/dev/seed-summary`
- `USE /api/auth`
- `USE /api/uploads`
- `USE /api/users`
- `USE /api/listings`
- `USE /api/favorites`
- `USE /api/messages`
- `USE /api/categories`
- `USE /api/engagement`
- `USE /api/reports`
- `USE /api/audit`

## 4.2 Auth (`auth.routes.ts`)

- `GET /api/auth/session` (protected)
- `POST /api/auth/resend-verification` (protected + rate-limited)
- `POST /api/auth/recaptcha/verify` (rate-limited)

## 4.3 Users (`users.routes.ts`)

- `POST /api/users/profile` (protected + validated)
- `PUT /api/users/profile` (protected + validated)
- `PATCH /api/users/profile` (protected + validated)
- `GET /api/users/profile` (protected)
- `GET /api/users/me` (protected)

## 4.4 Listings (`listings.routes.ts`)

- `GET /api/listings`
- `GET /api/listings/mine` (protected)
- `GET /api/listings/:id` (validated)
- `POST /api/listings` (protected + verified-email + contentFilter + validation)
- `PATCH /api/listings/:id` (protected + verified-email + contentFilter + validation)
- `POST /api/listings/:id/publish` (protected + verified-email)
- `POST /api/listings/:id/unpublish` (protected + verified-email)
- `POST /api/listings/:id/renew` (protected + verified-email + validation)
- `POST /api/listings/:id/expire` (protected + verified-email)
- `DELETE /api/listings/:id` (protected + verified-email)
- `POST /api/listings/:id/images` (protected + verified-email + validation)

## 4.5 Favorites (`favorites.routes.ts`)

router-level middleware:

- `verifyFirebaseToken`
- `requireVerifiedEmail`

endpoints:

- `POST /api/favorites/:listingId`
- `DELETE /api/favorites/:listingId`
- `GET /api/favorites`

## 4.6 Messages (`messages.routes.ts`)

- `POST /api/messages/conversations` (protected + verified-email + contentFilter + validation)
- `GET /api/messages/conversations` (protected + verified-email)
- `GET /api/messages/conversations/unread-summary` (protected + verified-email)
- `POST /api/messages/conversations/:conversationId/messages` (protected + verified-email + contentFilter + validation)
- `GET /api/messages/conversations/:conversationId` (protected + verified-email + validation)
- `GET /api/messages/conversations/:conversationId/messages` (protected + verified-email + validation)
- `POST /api/messages/conversations/:conversationId/read` (protected + verified-email + validation)

## 4.7 Uploads (`uploads.routes.ts`)

- `POST /api/uploads/listing-image` (protected + multer single image)
- `POST /api/uploads/profile-avatar` (protected + multer single image)

## 4.8 Categories (`routes/categories.ts`)

- `GET /api/categories` (validated query)

سلوك فعلي:

- يعتمد على Prisma database.
- إذا DB فارغة ومع `ENABLE_CATEGORIES_JSON_FALLBACK=true` قد يتم seed من JSON.
- عند فشل DB ومع fallback enabled -> يرجع response من JSON fallback.

## 4.9 Engagement (`engagement.routes.ts`)

- `POST /api/engagement/events` (protected)
- `GET /api/engagement/events/recent` (protected)

## 4.10 Reports (`reports.routes.ts`)

- `POST /api/reports` (protected + verified-email + validation)
- `GET /api/reports/queue` (protected + admin scope)
- `PATCH /api/reports/:id` (protected + admin scope + validation)

## 4.11 Audit (`audit.routes.ts`)

- `GET /api/audit/logs` (protected + admin scope)

---

## 5) التخزين الحالي للبيانات (واقع فعلي)

## 5.1 PostgreSQL عبر Prisma

Models المعرفة فعليًا في `prisma/schema.prisma`:

- `User`
- `Listing`
- `ListingImage`
- `Favorite`
- `Conversation`
- `ConversationParticipant`
- `Message`
- `Category`
- `Upload`

## 5.2 JSON file storage (ما يزال مستخدم فعليًا لبعض الوحدات)

حسب repositories الحالية:

- `reports` -> JSON file: `src/modules/reports/reports.data.json`
- `audit` -> JSON file: `src/modules/audit/audit.data.json`

## 5.3 In-memory storage (runtime only)

- `engagement` events مخزنة في memory array داخل `engagement.service.ts` (لا persistence بعد restart).

## 5.4 Fallback/Dev behavior

- categories endpoint يدعم JSON fallback إذا `ENABLE_CATEGORIES_JSON_FALLBACK=true`.
- `GET /api/dev/seed-summary` يحاول DB ثم fallback JSON إذا مسموح.

---

## 6) CI/CD الحالي فعليًا

## 6.1 CI (`.github/workflows/ci.yml`)

Triggers:

- push على `main`
- pull_request على `main`

Jobs:

- Backend:
  - `npm ci`
  - `npm run prisma:generate`
  - `npm run typecheck`
  - `npm run build`
- Web:
  - `npm ci`
  - `npm run validate:redirects`
  - `npm run lint`
  - `npm run build` مع env placeholders

## 6.2 Deploy (`.github/workflows/deploy.yml`)

Trigger:

- `workflow_run` بعد نجاح CI على `main`

السلوك الفعلي:

- يتحقق من secrets.
- SSH إلى السيرفر.
- يجلب آخر `origin/main`.
- backend:
  - install deps
  - prisma generate
  - TypeScript build
  - يكتب `.env` backend
  - `npm run db:check`
  - `prisma migrate deploy`
  - `npm run db:migrate-json`
  - restart PM2 `sooqna-backend`
- web:
  - يكتب `.env.local`
  - `npm ci`
  - `npm run build`
  - restart PM2 `sooqna-web`
- health check endpoint: `https://un.flashpointjordan.com/api/health`

---

## 7) ملفات توثيق موجودة حاليًا (Fact)

في `docs/` توجد فعليًا ملفات منها:

- `api-contract-v1.md`
- `project-structure-a-to-z.md`
- `week-3-profile-identity.md`
- `best-practices-technical-playbook.ar.md`
- `best-practices-checklists.ar.md`
- `user-action-batch/README.ar.md`

---

## 8) ملاحظات حالة حالية (ليست اقتراحات)

موجود فعليًا الآن في النظام:

- جزء من البيانات على PostgreSQL، وجزء على JSON files، وجزء in-memory.
- واجهة الويب تعتمد نظام ثيمات + RTL + Arabic UI.
- هناك pages مخصصة للاختبار والتطوير (`auth-test`, `dev-tools`, `listings-test`).
- deploy workflow يحتوي خطوات تنظيف/reset على السيرفر ضمن السكربت الحالي.

---

## 9) مرجع سريع للتشغيل الحالي

Backend:

```bash
cd backend/sooqna-backend
npm install
npm run dev
```

Web:

```bash
cd apps/web
npm install
npm run dev
```

---

إذا تريد، أستطيع في خطوة مباشرة بعد هذا الملف أن أطلع لك نسخة PDF منه بنفس اللحظة.

