import { prisma } from "../../../config/prisma";
import type { FavoriteRecord } from "../favorites.types";

export interface FavoritesRepository {
  listByUser(userId: string): Promise<FavoriteRecord[]>;
  upsert(record: FavoriteRecord): Promise<void>;
  remove(userId: string, listingId: string): Promise<void>;
}

export class PrismaFavoritesRepository implements FavoritesRepository {
  async listByUser(userId: string): Promise<FavoriteRecord[]> {
    try {
      const items = await prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return items.map((item) => ({
        userId: item.userId,
        listingId: item.listingId ?? "",
        createdAt: item.createdAt.toISOString(),
      }));
    } catch {
      throw new Error("Failed to fetch favorites.");
    }
  }

  async upsert(record: FavoriteRecord): Promise<void> {
    try {
      await prisma.favorite.upsert({
        where: {
          userId_listingId: {
            userId: record.userId,
            listingId: record.listingId ?? null,
          },
        },
        update: {
          createdAt: new Date(record.createdAt),
        },
        create: {
          userId: record.userId,
          listingId: record.listingId,
          createdAt: new Date(record.createdAt),
        },
      });
    } catch {
      throw new Error("Failed to save favorite.");
    }
  }

  async remove(userId: string, listingId: string): Promise<void> {
    try {
      await prisma.favorite.deleteMany({
        where: { userId, listingId },
      });
    } catch {
      throw new Error("Failed to remove favorite.");
    }
  }
}

