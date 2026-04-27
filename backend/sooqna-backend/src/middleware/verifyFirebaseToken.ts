import type { NextFunction, Request, Response } from "express";
import { adminAuth } from "../config/firebaseAdmin";

export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Missing Bearer token." });
    return;
  }
  try {
    req.authUser = await adminAuth.verifyIdToken(authHeader.slice(7));
    next();
  } catch (error) {
    console.error("Firebase Token Verification Error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token.", error: String(error) });
  }
}
