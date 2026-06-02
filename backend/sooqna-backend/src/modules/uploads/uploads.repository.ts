import { prisma } from "../../config/prisma";
import { nowIso } from "../../utils/time";

type CreateUploadInput = {
  url: string;
  path: string;
  listingId?: string | null;
};

export type UploadRecord = {
  id: string;
  url: string;
  path: string;
  listingId: string | null;
  createdAt: Date;
};

export interface UploadsRepository {
  create(input: CreateUploadInput): Promise<void>;
  markAttachedToListing(path: string, listingId: string): Promise<number>;
  findUnattachedOlderThan(cutoff: Date, limit: number): Promise<UploadRecord[]>;
  deleteByIds(ids: string[]): Promise<number>;
}

export class PrismaUploadsRepository implements UploadsRepository {
  async create(input: CreateUploadInput): Promise<void> {
    try {
      await prisma.upload.create({
        data: {
          url: input.url,
          path: input.path,
          listingId: input.listingId ?? null,
          createdAt: new Date(nowIso()),
        },
      });
    } catch (error) {
      throw new Error("Failed to store upload metadata.", { cause: error });
    }
  }

  async markAttachedToListing(path: string, listingId: string): Promise<number> {
    try {
      const result = await prisma.upload.updateMany({
        where: { path, listingId: null },
        data: { listingId },
      });
      return result.count;
    } catch (error) {
      throw new Error("Failed to attach upload metadata.", { cause: error });
    }
  }

  async findUnattachedOlderThan(cutoff: Date, limit: number): Promise<UploadRecord[]> {
    try {
      return prisma.upload.findMany({
        where: { listingId: null, createdAt: { lt: cutoff } },
        orderBy: { createdAt: "asc" },
        take: limit,
      });
    } catch (error) {
      throw new Error("Failed to find orphan uploads.", { cause: error });
    }
  }

  async deleteByIds(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    try {
      const result = await prisma.upload.deleteMany({
        where: { id: { in: ids } },
      });
      return result.count;
    } catch (error) {
      throw new Error("Failed to delete orphan upload metadata.", { cause: error });
    }
  }
}
