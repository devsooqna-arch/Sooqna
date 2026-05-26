export interface Review {
  id: string;
  sellerId: string;
  reviewerId: string;
  listingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicReview {
  id: string;
  rating: number;
  comment: string;
  reviewer: {
    fullName: string;
    photoURL: string;
  };
  listingId: string;
  createdAt: string;
}

export interface SellerStats {
  avgRating: number;
  totalReviews: number;
  totalListings: number;
  totalSold: number;
  memberSince: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdVerified: boolean;
}

export interface PublicSellerProfile {
  uid: string;
  fullName: string;
  photoURL: string;
  bio: string;
  stats: SellerStats;
}
