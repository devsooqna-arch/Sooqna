import { prisma } from "../../config/prisma";
import { nowIso } from "../../utils/time";

type CreateUploadInput = {
  url: string;
  path: string;
  listingId?: string | null;
};

export interface UploadsRepository {
  create(input: CreateUploadInput): Promise<void>;
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
    } catch {
      throw new Error("Failed to store upload metadata.");
    }
  }
}
