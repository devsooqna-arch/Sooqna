export const LISTING_PRICE_TYPES = ["fixed", "negotiable", "contact"] as const;
export const LISTING_STATUSES = [
  "draft",
  "pending",
  "published",
  "rejected",
  "sold",
  "archived",
] as const;
export const LISTING_CONDITIONS = ["new", "used"] as const;
export const LISTING_CONTACT_PREFERENCES = ["chat", "phone"] as const;

export const MESSAGE_TYPES = ["text", "image", "system"] as const;

export const USER_ROLES = ["ADMIN", "BUYER", "SELLER"] as const;
export const ACCOUNT_STATUSES = ["active"] as const;

export const CATEGORY_IDS = [
  "cars",
  "real-estate",
  "electronics",
  "furniture",
  "jobs",
  "fashion",
  "kids",
  "sports",
  "services",
  "other",
] as const;

export const CITY_IDS = [
  "aleppo",
  "damascus",
  "homs",
  "latakia",
  "tartus",
  "idlib",
  "alhasakah",
  "deirezzor",
] as const;
