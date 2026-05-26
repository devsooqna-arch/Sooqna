import type { NextFunction, Request, Response } from "express";
import { adminAuth } from "../config/firebaseAdmin";
import { logger } from "../config/logger";
import { sendError } from "../shared/contracts/api";

export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, 401, "UNAUTHORIZED", "Missing Bearer token.");
    return;
  }
  try {
    req.authUser = await adminAuth.verifyIdToken(authHeader.slice(7));
    next();
  } catch (error) {
    logger.warn("Firebase token verification failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    sendError(res, 401, "UNAUTHORIZED", "Invalid or expired token.");
  }
}
