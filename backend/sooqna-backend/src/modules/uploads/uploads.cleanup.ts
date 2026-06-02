import * as fs from "node:fs/promises";
import * as path from "node:path";
import { PrismaUploadsRepository, type UploadRecord, type UploadsRepository } from "./uploads.repository";

type CleanupOptions = {
  repository?: UploadsRepository;
  uploadsRoot?: string;
  olderThanHours?: number;
  limit?: number;
  dryRun?: boolean;
  now?: Date;
};

export type CleanupResult = {
  scanned: number;
  deletedFiles: number;
  deletedRows: number;
  skippedUnsafePaths: number;
  dryRun: boolean;
};

export function resolveUploadFilePath(uploadPath: string, uploadsRoot = path.resolve(process.cwd(), "uploads")): string | null {
  const normalized = uploadPath.replace(/\\/g, "/");
  if (!normalized.startsWith("uploads/")) return null;

  const relativePath = normalized.replace(/^uploads\//, "");
  const root = path.resolve(uploadsRoot);
  const resolved = path.resolve(root, relativePath);
  if (resolved === root || !resolved.startsWith(`${root}${path.sep}`)) return null;

  return resolved;
}

export async function cleanupOrphanUploads(options: CleanupOptions = {}): Promise<CleanupResult> {
  const repository = options.repository ?? new PrismaUploadsRepository();
  const olderThanHours = options.olderThanHours ?? 24;
  const limit = Math.max(1, Math.min(options.limit ?? 100, 1000));
  const now = options.now ?? new Date();
  const cutoff = new Date(now.getTime() - olderThanHours * 60 * 60 * 1000);
  const orphans = await repository.findUnattachedOlderThan(cutoff, limit);

  const deletedIds: string[] = [];
  let deletedFiles = 0;
  let skippedUnsafePaths = 0;

  for (const upload of orphans) {
    const filePath = resolveUploadFilePath(upload.path, options.uploadsRoot);
    if (!filePath) {
      skippedUnsafePaths += 1;
      continue;
    }

    if (!options.dryRun) {
      await fs.unlink(filePath).catch((error: unknown) => {
        if ((error as { code?: string }).code !== "ENOENT") throw error;
      });
    }
    deletedFiles += 1;
    deletedIds.push(upload.id);
  }

  const deletedRows = options.dryRun ? 0 : await repository.deleteByIds(deletedIds);
  return {
    scanned: orphans.length,
    deletedFiles,
    deletedRows,
    skippedUnsafePaths,
    dryRun: options.dryRun ?? false,
  };
}

export type { UploadRecord };
