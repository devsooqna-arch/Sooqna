import * as fs from "node:fs";
import * as path from "node:path";
import { randomBytes } from "node:crypto";
import multer from "multer";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export function isAllowedImageMimeType(mimeType: string): boolean {
  return allowedMimeTypes.has(mimeType);
}

export function hasAllowedImageExtension(fileName: string): boolean {
  return allowedExtensions.has(path.extname(fileName || "").toLowerCase());
}

export function hasValidImageSignature(bytes: Buffer): boolean {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return true;
  }
  return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/\.{2,}/g, ".")   // no path traversal via ..
    .substring(0, 80)
    || "image";
}

export function createImageUploader(folderType: "listings" | "profiles") {
  const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
      const userId = req.currentUser?.firebaseUid;
      if (!userId) {
        cb(new Error("Unauthorized"), "");
        return;
      }
      const dir = path.resolve(process.cwd(), "uploads", folderType, userId);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeBase = sanitizeFileName(path.basename(file.originalname, ext) || "image");
      const name = `${Date.now()}_${randomBytes(4).toString("hex")}_${safeBase}${ext}`;
      cb(null, name);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!isAllowedImageMimeType(file.mimetype) || !hasAllowedImageExtension(file.originalname)) {
        cb(new Error("Only jpg/jpeg/png/webp images are allowed."));
        return;
      }
      cb(null, true);
    },
  });
}

