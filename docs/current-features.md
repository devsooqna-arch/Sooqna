# Current Features (Milestone 1)

هذا الملف يوثق كل الفيتشرز الموجودة حاليًا في المشروع (الحالة الفعلية).

## 1) Authentication

- Email/Password Sign Up + Login
- Google Login (Popup flow)
- Logout
- Auth state management عبر `AuthProvider` و `useAuth`
- Friendly error mapping via `authService`

## 2) User Profile Creation (Firestore)

- إنشاء/تحديث `users/{uid}` تلقائيًا عند تسجيل الدخول (client safety net)
- Cloud Function trigger عند إنشاء مستخدم جديد (`onUserCreated` / `createUserProfile`)
- حقول أساسية مثل:
  - `uid`, `fullName`, `email`, `photoURL`
  - `role`, `accountStatus`, `isEmailVerified`
  - `createdAt`, `updatedAt`

## 3) Categories

- خدمة قراءة `categories` (قائمة + عنصر مفرد)
- Seed categories script
- Callable reseed utility (admin-only backend protection)

## 4) Listings Foundation

- إنشاء listing عبر callable function (`createListing`)
- قراءة listings المنشورة
- قراءة listing مفرد
- Mapping typed data إلى `Listing` type
- مكونات عرض:
  - `CreateListingForm`
  - `ListingsList`
  - `ListingCard`

## 5) Listing Image Upload

- رفع صورة إلى Firebase Storage
- جلب download URL + path
- حفظ metadata داخل `listings/{listingId}.images[]`
- دعم بنية متعددة الصور (order + isPrimary)

## 6) Favorites Foundation

- المسار: `users/{userId}/favorites/{listingId}`
- إضافة favorite
- حذف favorite
- فحص isFavorite
- جلب favorites للمستخدم
- جلب favorite listing IDs سريعًا للـ UI

## 7) Conversations / Messages Foundation

- إنشاء conversation
- إنشاء message داخل subcollection
- جلب conversation حسب id
- جلب messages مرتبة زمنيًا (asc)
- تحديث حقول آخر رسالة في conversation (`lastMessage*`)

## 8) System Test Dashboard

صفحة QA شاملة للتجربة اليدوية:

- المسار: `/system-test`
- تشمل:
  1. Authentication test
  2. Firebase Auth user viewer
  3. Firestore user profile viewer
  4. Categories test
  5. Create listing test
  6. Listings viewer
  7. Image upload test
  8. Favorites test
  9. Messages structure test
  10. Logout test

## 9) Cloud Functions Foundation

- Admin setup reusable (`ensureAdminApp`, `adminDb`)
- Auth trigger user profile creation
- Callable `createListing` with validation + default draft fields
- Categories callable reseed
- Seed scripts:
  - `seed:categories`
  - `seed:demo` (demo end-to-end data)

## 10) Rules and Indexing

- Firestore rules موجودة ومحدثة للمسارات الأساسية
- Firestore indexes مضافة لاستعلامات listings/conversations الأساسية
- Storage rules مفعّلة لرفع صور listings داخل user folder فقط:
  - `listings/{userId}/...`

## 11) Documentation موجودة حاليًا

- `docs/database-schema.md`
- `docs/messages-structure.md`
- `docs/favorites-structure.md`

