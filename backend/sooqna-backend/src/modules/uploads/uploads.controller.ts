import type { Request, Response } from "express";
import multer from "multer";
import * as path from "node:path";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/appError";
import { PrismaUploadsRepository } from "./uploads.repository";

const uploadsRepository = new PrismaUploadsRepository();

function toPublicUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  const base = env.uploadsPublicBaseUrl.replace(/\/$/, "");
  return `${base}/${normalized.replace(/^uploads\//, "")}`;
}

export async function uploadListingImage(req: Request, res: Response): Promise<void> {
  const file = req.file;
  const userId = req.authUser?.uid;
  if (!userId) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  if (!file) {
    throw new AppError(400, "Image file is required.", "VALIDATION_ERROR");
  }

  const relativePath = path
    .relative(process.cwd(), file.path)
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "");

  await uploadsRepository.create({
    url: toPublicUrl(relativePath),
    path: relativePath,
    listingId: null,
  });

  res.json({
    success: true,
    url: toPublicUrl(relativePath),
    path: relativePath,
    filename: file.filename,
    size: file.size,
  });
}

export function handleUploadError(
  err: unknown,
  _req: Request,
  _res: Response,
  next: (error?: unknown) => void
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(new AppError(400, "Image exceeds the 5MB upload limit.", "VALIDATION_ERROR"));
      return;
    }
    next(new AppError(400, err.message, "VALIDATION_ERROR"));
    return;
  }
  if (err instanceof Error) {
    next(new AppError(400, err.message, "VALIDATION_ERROR"));
    return;
  }
  next(err);
}

