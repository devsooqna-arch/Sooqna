import { ACCOUNT_STATUSES, USER_ROLES } from "../../shared/constants/domain";

export type UserRole = (typeof USER_ROLES)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

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

