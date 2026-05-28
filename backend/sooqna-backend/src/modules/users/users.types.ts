import { ACCOUNT_STATUSES, USER_ROLES } from "../../shared/constants/domain";

export type UserRole = (typeof USER_ROLES)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface UserProfile {
  id?: string;
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  bio?: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  isIdVerified?: boolean;
  avgRating?: number;
  totalReviews?: number;
  totalListings?: number;
  totalSold?: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

