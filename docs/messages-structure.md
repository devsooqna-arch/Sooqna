# Messages Structure (Milestone 1 Foundation)

This document defines the Firestore structure for conversations and messages.
It is intentionally focused on schema + service foundation only (no full chat UI yet).

## 1) Conversation document

Path:

`conversations/{conversationId}`

Example shape:

```json
{
  "participantIds": ["USER_1", "USER_2"],
  "participants": {
    "USER_1": { "fullName": "Issa", "photoURL": "https://..." },
    "USER_2": { "fullName": "Mohammad", "photoURL": "https://..." }
  },
  "listingId": "LISTING_ID",
  "listingSnapshot": {
    "title": "هونداي إلنترا 2017",
    "primaryImageURL": "https://..."
  },
  "createdBy": "USER_1",
  "lastMessageText": "مرحبا، هل الإعلان متاح؟",
  "lastMessageSenderId": "USER_1",
  "lastMessageAt": null,
  "lastMessageType": "text",
  "isActive": true,
  "createdAt": null,
  "updatedAt": null
}
```

Field meanings:

- `participantIds`: list used for access checks and user-centric querying.
- `participants`: lightweight user snapshots to render chat header quickly.
- `listingId`: relation to listing.
- `listingSnapshot`: denormalized listing preview used inside conversation UI.
- `createdBy`: user who initiated the conversation.
- `lastMessage*`: cached summary for conversation list ordering and previews.
- `isActive`: soft state to archive/close later without deleting history.
- `createdAt` / `updatedAt`: audit timestamps.

## 2) Messages subcollection

Path:

`conversations/{conversationId}/messages/{messageId}`

Example shape:

```json
{
  "senderId": "USER_1",
  "type": "text",
  "text": "مرحبا، هل السعر قابل للتفاوض؟",
  "attachments": [],
  "isRead": false,
  "readAt": null,
  "createdAt": null,
  "deletedAt": null
}
```

Field meanings:

- `senderId`: user id who sent the message.
- `type`: one of `text | image | system`.
- `text`: message body.
- `attachments`: optional payload list for future media/files.
- `isRead` / `readAt`: read tracking foundation.
- `createdAt`: message creation time.
- `deletedAt`: soft delete foundation for moderation/history handling.

## Why messages are a subcollection (not an array)

- Conversations can grow very large; arrays hit document size and write limits.
- Subcollections allow paginated reads and better query performance.
- Each new message becomes an independent document write.
- Better support for future moderation, attachments, and indexing.

## How this supports future real-time chat

- Real-time listeners can later subscribe to:
  - `conversations` list (for current user)
  - `messages` subcollection for an open conversation
- Conversation-level `lastMessage*` fields provide fast chat list rendering.
- Message docs already include fields needed for delivery/read state expansion.
- Works cleanly with future milestones (typing indicators, unread counters, media, moderation).

