import type { DecodedIdToken } from "firebase-admin/auth";
import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      authUser?: DecodedIdToken;
      userRole?: Role;
    }
  }
}

export {};

