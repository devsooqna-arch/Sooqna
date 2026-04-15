# Firestore database schema (Sooqna)

Naming: **collections** — lowercase plural; **fields** — camelCase; document **IDs** — auto-generated unless noted (e.g. `users/{uid}` uses Auth `uid`).

---

## `users/{userId}`

| Field | Type | Purpose |
|--------|------|---------|
| `uid` | `string` | Same as Firebase Auth UID and document id. |
| `fullName` | `string` | Display name from Auth profile. |
| `email` | `string` | Primary email. |
| `photoURL` | `string` | Profile image URL. |
| `role` | `"user" \| "admin" \| "moderator"` | Authorization role (Milestone 1 defaults to `user`). |
| `accountStatus` | `"active" \| "suspended" \| "blocked" \| "deleted"` | Account lifecycle. |
| `isEmailVerified` | `boolean` | Mirrors Auth email verification. |
| `phoneNumber` | `string` | Optional; added when phone auth is used. |
| `bio` | `string` | Short profile text. |
| `city` | `string` | User city. |
| `country` | `string` | User country. |
| `preferredLanguage` | `string` | e.g. `ar`, `en`. |
| `isPhoneVerified` | `boolean` | Phone verification flag. |
| `profileCompleted` | `boolean` | Onboarding completion. |
| `listingsCount` | `number` | Denormalized count of listings. |
| `favoritesCount` | `number` | Denormalized favorites count. |
| `lastLoginAt` | `timestamp \| null` | Last sign-in time. |
| `createdAt` | `timestamp` | Profile creation time. |
| `updatedAt` | `timestamp` | Last profile update. |

**Purpose:** User profile and counters; `userId` equals Auth `uid`.

---

## `categories/{categoryId}`

| Field | Type | Purpose |
|--------|------|---------|
| `slug` | `string` | URL-safe id (may match document id). |
| `name` | `map` | `{ ar: string, en: string }` localized labels. |
| `icon` | `string` | Icon key or name. |
| `imageURL` | `string` | Optional category image. |
| `parentId` | `string \| null` | Parent category for subcategories. |
| `level` | `number` | Depth in tree (1 = root). |
| `isActive` | `boolean` | Whether shown in UI. |
| `sortOrder` | `number` | Display order. |
| `createdAt` | `timestamp` | Created. |
| `updatedAt` | `timestamp` | Updated. |

**Purpose:** Marketplace taxonomy (cars, real estate, electronics, …).

---

## `listings/{listingId}`

| Field | Type | Purpose |
|--------|------|---------|
| `title` | `string` | Listing title. |
| `titleLower` | `string` | Normalized title for search/filters. |
| `description` | `string` | Full description. |
| `price` | `number` | Price amount. |
| `currency` | `string` | e.g. `JOD`. |
| `priceType` | `string` | e.g. `fixed`, `negotiable`, `contact`. |
| `categoryId` | `string` | Reference to `categories`. |
| `subCategoryId` | `string` | Optional subcategory. |
| `ownerId` | `string` | Seller user id (`users`). |
| `ownerSnapshot` | `map` | `{ fullName, photoURL }` denormalized for fast UI. |
| `location` | `map` | `{ country, city, area }`. |
| `images` | `array` | Image metadata `{ url, path, isPrimary, order }`. |
| `status` | `string` | `draft`, `pending`, `published`, `sold`, `archived`, `rejected`, `deleted`, `expired`. |
| `condition` | `string` | e.g. `new`, `used`. |
| `contactPreference` | `string` | e.g. `chat`, `phone`. |
| `tags` | `array<string>` | Search tags. |
| `attributes` | `map` | Category-specific dynamic fields. |
| `viewsCount` | `number` | View counter. |
| `favoritesCount` | `number` | Favorites counter. |
| `messagesCount` | `number` | Message counter. |
| `reportsCount` | `number` | Reports counter. |
| `isFeatured` | `boolean` | Featured placement. |
| `isApproved` | `boolean` | Moderation flag. |
| `publishedAt` | `timestamp \| null` | When published. |
| `expiresAt` | `timestamp \| null` | Optional expiry. |
| `createdAt` | `timestamp` | Created. |
| `updatedAt` | `timestamp` | Updated. |
| `deletedAt` | `timestamp \| null` | Soft delete. |

**Purpose:** Core sell-side entity; Milestone 1 callable may create minimal `draft` rows first, then expand fields.

---

## `conversations/{conversationId}`

| Field | Type | Purpose |
|--------|------|---------|
| `participantIds` | `array<string>` | User ids in the thread. |
| `participants` | `map` | `userId` → `{ fullName, photoURL }` snapshots. |
| `listingId` | `string` | Related listing. |
| `listingSnapshot` | `map` | `{ title, primaryImageURL }` denormalized. |
| `createdBy` | `string` | Who opened the thread. |
| `lastMessageText` | `string` | Preview text. |
| `lastMessageSenderId` | `string` | Last sender. |
| `lastMessageAt` | `timestamp` | Sort key for inbox. |
| `lastMessageType` | `string` | `text`, `image`, `system`. |
| `isActive` | `boolean` | Thread open/closed. |
| `createdAt` | `timestamp` | Created. |
| `updatedAt` | `timestamp` | Updated. |

**Purpose:** Buyer–seller chat threads (dedupe same listing + pair via Cloud Functions recommended).

---

## `conversations/{conversationId}/messages/{messageId}`

| Field | Type | Purpose |
|--------|------|---------|
| `senderId` | `string` | Author user id. |
| `type` | `string` | `text`, `image`, `system`. |
| `text` | `string` | Message body (if text). |
| `attachments` | `array` | Extra media metadata. |
| `isRead` | `boolean` | Read receipt. |
| `readAt` | `timestamp \| null` | When read. |
| `createdAt` | `timestamp` | Sent time. |
| `deletedAt` | `timestamp \| null` | Soft delete. |

**Purpose:** Messages stay in a subcollection so threads do not hit document size limits.

---

## `users/{userId}/favorites/{listingId}`

| Field | Type | Purpose |
|--------|------|---------|
| `listingId` | `string` | Same as document id. |
| `createdAt` | `timestamp` | When favorited. |

**Purpose:** Per-user saved listings; listing also stores `favoritesCount`.

---

## `users/{userId}/notifications/{notificationId}`

| Field | Type | Purpose |
|--------|------|---------|
| `type` | `string` | e.g. `listingApproved`, `newMessage`, `system`. |
| `title` | `string` | Short title. |
| `body` | `string` | Body copy. |
| `data` | `map` | Deep-link payload (`listingId`, etc.). |
| `isRead` | `boolean` | Read state. |
| `readAt` | `timestamp \| null` | When read. |
| `createdAt` | `timestamp` | Created. |

**Purpose:** In-app notification inbox scoped per user.

---

## `reports/{reportId}`

| Field | Type | Purpose |
|--------|------|---------|
| `targetType` | `string` | `listing`, `user`, `message`. |
| `targetId` | `string` | Reported entity id. |
| `reportedBy` | `string` | Reporter user id. |
| `reason` | `string` | `spam`, `abusive`, `fake`, etc. |
| `details` | `string` | Free text. |
| `status` | `string` | `open`, `reviewing`, `resolved`, `rejected`. |
| `reviewedBy` | `string \| null` | Moderator id. |
| `reviewedAt` | `timestamp \| null` | When reviewed. |
| `createdAt` | `timestamp` | Created. |
| `updatedAt` | `timestamp` | Updated. |

**Purpose:** Moderation queue for abuse and policy violations.
