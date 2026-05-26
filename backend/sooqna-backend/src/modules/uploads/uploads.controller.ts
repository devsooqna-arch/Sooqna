import type { Request, Response } from "express";
import multer from "multer";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/appError";
import { PrismaUploadsRepository } from "./uploads.repository";
import { hasValidImageSignature } from "./uploads.config";

const uploadsRepository = new PrismaUploadsRepository();

function toPublicUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  const base = env.uploadsPublicBaseUrl.replace(/\/$/, "");
  return `${base}/${normalized.replace(/^uploads\//, "")}`;
}

async function assertValidStoredImage(filePath: string): Promise<void> {
  const handle = await fs.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (!hasValidImageSignature(buffer.subarray(0, bytesRead))) {
      await fs.unlink(filePath).catch(() => undefined);
      throw new AppError(400, "Uploaded file is not a valid JPG, PNG, or WEBP image.", "VALIDATION_ERROR");
    }
  } finally {
    await handle.close();
  }
}

export async function uploadListingImage(req: Request, res: Response): Promise<void> {
  const file = req.file;
  const userId = req.currentUser?.firebaseUid;
  if (!userId) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  if (!file) {
    throw new AppError(400, "Image file is required.", "VALIDATION_ERROR");
  }
  await assertValidStoredImage(file.path);

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

export async function uploadProfileAvatar(req: Request, res: Response): Promise<void> {
  const file = req.file;
  const userId = req.currentUser?.firebaseUid;
  if (!userId) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  if (!file) {
    throw new AppError(400, "Image file is required.", "VALIDATION_ERROR");
  }
  await assertValidStoredImage(file.path);

  const relativePath = path
    .relative(process.cwd(), file.path)
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "");

  const avatarUrl = toPublicUrl(relativePath);

  await uploadsRepository.create({
    url: avatarUrl,
    path: relativePath,
    listingId: null,
  });

  res.json({
    success: true,
    avatarUrl,
    avatarPath: relativePath,
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

