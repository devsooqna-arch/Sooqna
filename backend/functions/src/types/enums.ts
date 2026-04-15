/** User role — stored on `users.role`. */
export type UserRole = "user" | "admin" | "moderator";

/** Account lifecycle — `users.accountStatus`. */
export type AccountStatus = "active" | "suspended" | "blocked" | "deleted";

/** Listing lifecycle — `listings.status`. */
export type ListingStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "sold"
  | "archived"
  | "deleted"
  | "expired";

/** How price is interpreted — `listings.priceType`. */
export type PriceType = "fixed" | "negotiable" | "contact";

/** Item condition — `listings.condition`. */
export type ListingCondition = "new" | "used";

/** Preferred contact channel — `listings.contactPreference`. */
export type ContactPreference = "chat" | "phone" | "whatsapp" | "email";

/** Report subject — `reports.targetType`. */
export type ReportTargetType = "listing" | "user" | "message";

/** Report reason — `reports.reason`. */
export type ReportReason =
  | "spam"
  | "abusive"
  | "fake"
  | "duplicate"
  | "scam"
  | "other";

/** Moderation workflow — `reports.status`. */
export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

/** Chat message payload — `messages.type`. */
export type MessageType = "text" | "image" | "system";

/** In-app notification kinds — `notifications.type`. */
export type NotificationType =
  | "listingApproved"
  | "listingRejected"
  | "newMessage"
  | "listingExpired"
  | "listingFavorited"
  | "system";
