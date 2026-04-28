import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { sendError } from "../shared/contracts/api";

function containsBlockedKeyword(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const keyword of env.moderationBlockedKeywords) {
    if (keyword && normalized.includes(keyword)) return keyword;
  }
  return null;
}

function extractTextPayload(req: Request): string {
  const chunks: string[] = [];
  const body = req.body ?? {};
  if (typeof body.title === "string") chunks.push(body.title);
  if (typeof body.description === "string") chunks.push(body.description);
  if (typeof body.text === "string") chunks.push(body.text);
  if (body.listingSnapshot && typeof body.listingSnapshot.title === "string") {
    chunks.push(body.listingSnapshot.title);
  }
  return chunks.join(" ").trim();
}

export function contentFilter(req: Request, res: Response, next: NextFunction): void {
  if (!env.moderationBlockedKeywords.length) {
    next();
    return;
  }
  const payload = extractTextPayload(req);
  const blockedKeyword = containsBlockedKeyword(payload);
  if (!blockedKeyword) {
    next();
    return;
  }
  sendError(
    res,
    400,
    "CONTENT_POLICY_VIOLATION",
    "Content contains blocked keywords.",
    { blockedKeyword }
  );
}
