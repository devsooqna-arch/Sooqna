import type { NextFunction, Request, Response } from "express";
import { sendError } from "../shared/contracts/api";
import { PrismaUsersRepository } from "../modules/users/repositories/users.repository";
import { UsersService } from "../modules/users/users.service";

const usersService = new UsersService(new PrismaUsersRepository());

export async function requireCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.authUser?.uid) {
    sendError(res, 401, "UNAUTHORIZED", "Unauthorized.");
    return;
  }

  try {
    const profile = await usersService.getOrCreateMe(req.authUser);
    req.currentUser = {
      firebaseUid: profile.uid,
      email: profile.email,
      emailVerified: profile.isEmailVerified,
      displayName: profile.fullName,
      photoURL: profile.photoURL,
      dbUser: {
        id: profile.id ?? profile.uid,
        firebaseUid: profile.uid,
      },
      role: profile.role,
      accountStatus: profile.accountStatus,
    };
    req.userRole = profile.role;
    next();
  } catch (error) {
    sendError(
      res,
      503,
      "USER_CONTEXT_UNAVAILABLE",
      "Unable to load authenticated user context.",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export function requireActiveUser(req: Request, res: Response, next: NextFunction): void {
  if (!req.currentUser) {
    sendError(res, 401, "UNAUTHORIZED", "Unauthorized.");
    return;
  }

  if (req.currentUser.accountStatus !== "active") {
    sendError(
      res,
      403,
      "ACCOUNT_NOT_ACTIVE",
      "Account is not active. This action is not allowed."
    );
    return;
  }

  next();
}
