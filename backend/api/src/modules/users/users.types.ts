export type UserRole = "user";
export type AccountStatus = "active";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

