import type { FirestoreDate } from "./firestore";
import type { AccountStatus, UserRole } from "./enums";

/**
 * `users/{userId}` — document id equals Firebase Auth `uid`.
 */
export interface User {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  bio: string;
  city: string;
  country: string;
  preferredLanguage: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileCompleted: boolean;
  listingsCount: number;
  favoritesCount: number;
  lastLoginAt: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}
