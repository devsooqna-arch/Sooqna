import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { sendError } from "../shared/contracts/api";

export function requireVerifiedEmail(req: Request, res: Response, next: NextFunction): void {
  if (!env.requireEmailVerified) {
    next();
    return;
  }

  if (!req.authUser && !req.currentUser) {
    sendError(res, 401, "UNAUTHORIZED", "Unauthorized.");
    return;
  }

  const emailVerified = req.currentUser?.emailVerified ?? req.authUser?.email_verified ?? false;
  if (!emailVerified) {
    sendError(
      res,
      403,
      "EMAIL_NOT_VERIFIED",
      "Email verification is required before using this endpoint."
    );
    return;
  }

  next();
}
