import type { Request, Response } from "express";
import * as path from "node:path";
import { env } from "../../config/env";

function toPublicUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  const base = env.uploadsPublicBaseUrl.replace(/\/$/, "");
  return `${base}/${normalized.replace(/^uploads\//, "")}`;
}

export async function uploadListingImage(req: Request, res: Response): Promise<void> {
  const file = req.file;
  const userId = req.authUser?.uid;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  if (!file) {
    res.status(400).json({ success: false, message: "Image file is required." });
    return;
  }

  const relativePath = path
    .relative(process.cwd(), file.path)
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "");

  res.json({
    success: true,
    url: toPublicUrl(relativePath),
    path: relativePath,
    filename: file.filename,
    size: file.size,
  });
}

