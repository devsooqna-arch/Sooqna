import * as fs from "node:fs";
import * as path from "node:path";
import { randomBytes } from "node:crypto";
import multer from "multer";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

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
      const userId = req.authUser?.uid;
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
      if (!allowedMimeTypes.has(file.mimetype)) {
        cb(new Error("Only jpg/jpeg/png/webp images are allowed."));
        return;
      }
      cb(null, true);
    },
  });
}

