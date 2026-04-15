import type { FirestoreDate } from "./firestore";
import type {
  ContactPreference,
  ListingCondition,
  ListingStatus,
  PriceType,
} from "./enums";

export interface OwnerSnapshot {
  fullName: string;
  photoURL: string;
}

export interface ListingLocation {
  country: string;
  city: string;
  area: string;
}

export interface ListingImage {
  url: string;
  path: string;
  isPrimary: boolean;
  order: number;
}

/** Dynamic per-category specs (year, km, rooms, etc.). */
export type ListingAttributes = Record<string, string | number | boolean | null>;

/**
 * `listings/{listingId}`
 */
export interface Listing {
  title: string;
  titleLower: string;
  description: string;
  price: number;
  currency: string;
  priceType: PriceType;
  categoryId: string;
  subCategoryId: string;
  ownerId: string;
  ownerSnapshot: OwnerSnapshot;
  location: ListingLocation;
  images: ListingImage[];
  status: ListingStatus;
  condition: ListingCondition;
  contactPreference: ContactPreference;
  tags: string[];
  attributes: ListingAttributes;
  viewsCount: number;
  favoritesCount: number;
  messagesCount: number;
  reportsCount: number;
  isFeatured: boolean;
  isApproved: boolean;
  publishedAt: FirestoreDate;
  expiresAt: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
  deletedAt: FirestoreDate;
}
