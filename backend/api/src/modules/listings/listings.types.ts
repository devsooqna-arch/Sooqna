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

export interface Listing {
  id: string;
  title: string;
  titleLower: string;
  description: string;
  price: number;
  currency: "JOD";
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

