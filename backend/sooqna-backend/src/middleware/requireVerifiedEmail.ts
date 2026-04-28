import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { sendError } from "../shared/contracts/api";

export function requireVerifiedEmail(req: Request, res: Response, next: NextFunction): void {
  if (!env.requireEmailVerified) {
    next();
    return;
  }

  if (!req.authUser) {
    sendError(res, 401, "UNAUTHORIZED", "Unauthorized.");
    return;
  }

  if (!req.authUser.email_verified) {
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
