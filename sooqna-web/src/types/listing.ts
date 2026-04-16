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
  priceType: "fixed" | "negotiable" | "contact";
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
  status: "draft" | "pending" | "published" | "rejected" | "sold" | "archived";
  condition: "new" | "used";
  contactPreference: "chat" | "phone";
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

