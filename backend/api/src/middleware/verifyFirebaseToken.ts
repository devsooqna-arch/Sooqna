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

  const token = authHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.authUser = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

