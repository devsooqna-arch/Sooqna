export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  role: "user";
  accountStatus: "active";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

