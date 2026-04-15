/**
 * Canonical collection paths (lowercase plural) for helpers and rules cross-checks.
 */
export const COLLECTIONS = {
  users: "users",
  categories: "categories",
  listings: "listings",
  conversations: "conversations",
  reports: "reports",
} as const;

export const SUBCOLLECTIONS = {
  favorites: "favorites",
  messages: "messages",
  notifications: "notifications",
} as const;
