import type { DecodedIdToken } from "firebase-admin/auth";
import type { Role } from "@prisma/client";

type TrustedAuthenticatedUser = {
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  dbUser: {
    id: string;
    firebaseUid: string;
  };
  role: Role;
  accountStatus: string;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: DecodedIdToken;
      currentUser?: TrustedAuthenticatedUser;
      userRole?: Role;
    }
  }
}

export {};

