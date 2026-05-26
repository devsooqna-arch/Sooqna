import {
  LISTING_CONDITIONS,
  LISTING_CONTACT_PREFERENCES,
  LISTING_CURRENCIES,
  LISTING_PRICE_TYPES,
  LISTING_STATUSES,
} from "../../shared/constants/domain";

export type ListingPriceType = (typeof LISTING_PRICE_TYPES)[number];
export type ListingStatus = (typeof LISTING_STATUSES)[number];
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];
export type ListingContactPreference = (typeof LISTING_CONTACT_PREFERENCES)[number];
export type ListingCurrency = (typeof LISTING_CURRENCIES)[number];

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
  clientRequestId?: string | null;
  description: string;
  price: number;
  currency: ListingCurrency;
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
  soldAt: string | null;
  archivedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PublicListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: ListingCurrency;
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
  images: Array<Omit<ListingImage, "path">>;
  status: ListingStatus;
  condition: ListingCondition;
  contactPreference: ListingContactPreference;
  viewsCount: number;
  favoritesCount: number;
  messagesCount: number;
  isFeatured: boolean;
  imageCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export function toPublicListing(listing: Listing): PublicListing {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    currency: listing.currency,
    priceType: listing.priceType,
    categoryId: listing.categoryId,
    ownerId: listing.ownerId,
    ownerSnapshot: listing.ownerSnapshot,
    location: listing.location,
    images: listing.images.map(({ url, isPrimary, order }) => ({ url, isPrimary, order })),
    status: listing.status,
    condition: listing.condition,
    contactPreference: listing.contactPreference,
    viewsCount: listing.viewsCount,
    favoritesCount: listing.favoritesCount,
    messagesCount: listing.messagesCount,
    isFeatured: listing.isFeatured,
    imageCount: listing.images.length,
    publishedAt: listing.publishedAt,
    createdAt: listing.createdAt,
  };
}

