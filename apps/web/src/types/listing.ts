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
export type ListingCurrency = "SYP" | "USD";

export interface ListingImage {
  url: string;
  path?: string;
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
  titleLower?: string;
  description: string;
  price: number;
  currency: ListingCurrency;
  priceType: ListingPriceType;
  categoryId: string;
  ownerId: string;
  ownerSnapshot: ListingOwnerSnapshot;
  location: ListingLocation;
  images: ListingImage[];
  status: ListingStatus;
  condition: ListingCondition;
  contactPreference: ListingContactPreference;
  /** E.164 or local digits — when set, UI may offer WhatsApp deep link */
  contactPhone?: string;
  viewsCount: number;
  favoritesCount: number;
  messagesCount: number;
  isFeatured: boolean;
  isApproved?: boolean;
  imageCount?: number;
  publishedAt: string | null;
  soldAt?: string | null;
  archivedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface ListingsPageResponse {
  success: boolean;
  listings: Listing[];
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters?: {
    category: string | null;
    city: string | null;
    search: string | null;
    sort: "newest" | "price_asc" | "price_desc";
    priceMin: number | null;
    priceMax: number | null;
  };
}

/**
 * Milestone 1 input accepted by backend REST API.
 */
export interface ListingDetailResponse {
  success: boolean;
  listing: Listing;
  seller: import("./review").PublicSellerProfile | null;
  reviews: import("./review").PublicReview[];
}

export interface CreateListingInput {
  title: string;
  price: number;
  currency?: ListingCurrency;
  categoryId: string;
  description?: string;
  clientRequestId?: string;
  location?: {
    country?: string;
    city?: string;
    area?: string;
  };
}

export interface CreateListingResult {
  success?: boolean;
  listingId: string;
}
