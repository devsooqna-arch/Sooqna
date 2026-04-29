import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { sendError } from "../shared/contracts/api";

export function checkRole(roles: Role[]) {
  return async function checkRoleMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const uid = req.authUser?.uid;
    if (!uid) {
      sendError(res, 401, "UNAUTHORIZED", "Unauthorized.");
      return;
    }

    if (!req.userRole) {
      try {
        const user = await prisma.user.findUnique({
          where: { firebaseUid: uid },
          select: { role: true },
        });
        if (!user) {
          sendError(res, 403, "FORBIDDEN", "User role is required.");
          return;
        }
        req.userRole = user.role;
      } catch {
        sendError(res, 503, "ROLE_LOOKUP_FAILED", "Unable to verify user role.");
        return;
      }
    }

    if (!roles.includes(req.userRole)) {
      sendError(res, 403, "FORBIDDEN", "Insufficient role for this route.");
      return;
    }

    next();
  };
}
