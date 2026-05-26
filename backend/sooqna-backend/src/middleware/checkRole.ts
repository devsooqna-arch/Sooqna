import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { sendError } from "../shared/contracts/api";

export function checkRole(roles: Role[]) {
  return async function checkRoleMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.currentUser) {
      sendError(res, 401, "UNAUTHORIZED", "Unauthorized.");
      return;
    }

    if (!roles.includes(req.currentUser.role)) {
      sendError(res, 403, "FORBIDDEN", "Insufficient role for this route.");
      return;
    }

    next();
  };
}
