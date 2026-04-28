import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { sendError } from "../shared/contracts/api";

export function requireAdminScope(req: Request, res: Response, next: NextFunction): void {
  const uid = req.authUser?.uid;
  if (!uid) {
    sendError(res, 401, "UNAUTHORIZED", "Unauthorized.");
    return;
  }
  if (!env.adminUids.includes(uid)) {
    sendError(res, 403, "FORBIDDEN", "Admin scope is required.");
    return;
  }
  next();
}
