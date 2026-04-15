# Favorites Structure (Milestone 1 Foundation)

This document defines the favorites data model for Milestone 1.
Scope is foundation only: schema + service functions, no full UI yet.

## Firestore structure

Path:

`users/{userId}/favorites/{listingId}`

Document shape:

```json
{
  "listingId": "LISTING_ID",
  "createdAt": null
}
```

Notes:

- `listingId` document id is the same as the listing id.
- `createdAt` is written using `serverTimestamp()`.

## Why favorites are stored under the user

- Most common read pattern is: "get favorites for current user".
- Keeps user-specific reads straightforward and efficient.
- Makes per-user security rules simpler and safer.
- Avoids scanning a global favorites collection for user filters.

## Why listingId is the document id

- Fast existence check for favorite state:
  - directly read `users/{userId}/favorites/{listingId}`
  - no query needed
- Prevents duplicate favorites for the same listing/user naturally.
- Simplifies add/remove operations to deterministic document paths.

## Fast checks and future UI integration

This structure enables:

- quick favorite toggle buttons on listing cards/details
- fast "is favorited?" checks
- easy batch mapping of favorite listing ids in UI state

## Future extension: listing favoritesCount

Milestone 1 keeps logic simple and does not maintain listing counters yet.

Later (Milestone 2+), add counter updates on:

- `addToFavorites` -> increment `listings/{listingId}.favoritesCount`
- `removeFromFavorites` -> decrement `listings/{listingId}.favoritesCount`

Recommended approach:

- transaction or callable function to keep count consistent under concurrency.

