# Current Working Structure

هذا الملف يوثق الـ structure الحالي للمشروع (Monorepo + Firebase architecture).

## 1) Monorepo Root

```text
sooqna/
├── apps/
│   ├── web/
│   └── mobile/
├── backend/
│   ├── functions/
│   ├── shared/
│   └── config/
├── docs/
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
└── .firebaserc
```

## 2) Web App Structure (Next.js App Router)

المسار: `apps/web`

أهم الأجزاء:

- `src/app/`:
  - routes/pages مثل:
    - `/`
    - `/login`
    - `/me`
    - `/auth-test`
    - `/listings-test`
    - `/admin/seed`
    - `/system-test`
- `src/components/`:
  - `auth/`
  - `listings/`
  - `me/`
  - `system-test/`
- `src/services/`:
  - `authService`
  - `userProfileService`
  - `categoryService`
  - `listingService`
  - `storageService`
  - `listingImageService`
  - `favoriteService`
  - `messageService`
  - `adminService`
- `src/hooks/`:
  - `useAuth`
  - `useFirestoreUserDoc`
- `src/contexts/`:
  - `auth-context`
- `src/lib/firebase.ts`:
  - Firebase client config (Auth/Firestore/Storage)
- `src/types/`:
  - `category`, `listing`, `favorite`, `message`

## 3) Cloud Functions Structure

المسار: `backend/functions`

```text
backend/functions/
├── src/
│   ├── config/
│   │   └── admin.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── createUserProfile.ts
│   │   │   └── index.ts
│   │   ├── listings/
│   │   │   ├── createListing.ts
│   │   │   └── index.ts
│   │   ├── categories/
│   │   │   ├── seedCategoriesData.ts
│   │   │   ├── seedCategoriesCallable.ts
│   │   │   └── index.ts
│   │   ├── users/
│   │   │   └── index.ts
│   │   └── messages/
│   │       └── index.ts
│   ├── types/
│   └── index.ts
├── scripts/
│   ├── seedCategories.ts
│   └── seedDemoData.ts
├── package.json
└── tsconfig.json
```

## 4) Firestore Data Structure (Current Foundation)

- `users/{userId}`
- `users/{userId}/favorites/{listingId}`
- `users/{userId}/notifications/{notificationId}`
- `categories/{categoryId}`
- `listings/{listingId}`
- `conversations/{conversationId}`
- `conversations/{conversationId}/messages/{messageId}`
- `reports/{reportId}`

## 5) Storage Structure (Current)

- `listings/{userId}/{timestamp}_{fileName}`

Rules intent:
- authenticated uploads only
- user uploads only داخل folder تبعه

## 6) Integration Flow (High-level)

1. User authenticates (email/google)
2. Profile ensured in `users/{uid}` (client + function safety)
3. User creates listing via callable `createListing`
4. Image uploaded to Storage + image metadata attached to listing
5. Favorites/messages تعمل عبر subcollections/services
6. Dashboard `/system-test` يتحقق من كل الـ flows يدويًا

