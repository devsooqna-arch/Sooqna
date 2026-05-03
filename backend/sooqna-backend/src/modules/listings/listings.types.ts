import {
  LISTING_CONDITIONS,
  LISTING_CONTACT_PREFERENCES,
  LISTING_PRICE_TYPES,
  LISTING_STATUSES,
} from "../../shared/constants/domain";

export type ListingPriceType = (typeof LISTING_PRICE_TYPES)[number];
export type ListingStatus = (typeof LISTING_STATUSES)[number];
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];
export type ListingContactPreference = (typeof LISTING_CONTACT_PREFERENCES)[number];

export interface ListingImage {
  url: string;
  path: string;
  isPrimary: boolean;
  order: number;
}

export interface Listing {
  id: string;
  title: string;
  titleLower: string;
  description: string;
  price: number;
  currency: "SYP" | "JOD";
  priceType: ListingPriceType;
  categoryId: string;
  ownerId: string;
  ownerSnapshot: {
    fullName: string;
    photoURL: string;
  };
  location: {
    country: string;
    city: string;
    area: string;
  };
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

