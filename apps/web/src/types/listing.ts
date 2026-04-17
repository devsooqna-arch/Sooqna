export type ListingPriceType = "fixed" | "negotiable" | "contact";
export type ListingStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "sold"
  | "archived";
export type ListingCondition = "new" | "used";
export type ListingContactPreference = "chat" | "phone";

export interface ListingImage {
  url: string;
  path: string;
  isPrimary: boolean;
  order: number;
}

export interface ListingLocation {
  country: string;
  city: string;
  area: string;
}

export interface ListingOwnerSnapshot {
  fullName: string;
  photoURL: string;
}

export interface Listing {
  id: string;
  title: string;
  titleLower: string;
  description: string;
  price: number;
  currency: string;
  priceType: ListingPriceType;
  categoryId: string;
  ownerId: string;
  ownerSnapshot: ListingOwnerSnapshot;
  location: ListingLocation;
  images: ListingImage[];
  status: ListingStatus;
  condition: ListingCondition;
  contactPreference: ListingContactPreference;
  viewsCount: number;
  favoritesCount: number;
  messagesCount: number;
  isFeatured: boolean;
  isApproved: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

/**
 * Milestone 1 input accepted by backend REST API.
 */
export interface CreateListingInput {
  title: string;
  price: number;
  categoryId: string;
}

export interface CreateListingResult {
  success?: boolean;
  listingId: string;
}

