import { nowIso } from "../../utils/time";
import { AppError } from "../../shared/errors/appError";
import { PrismaListingsRepository } from "../listings/repositories/listings.repository";
import type { FavoritesRepository } from "./repositories/favorites.repository";
import { trackEngagementEvent } from "../engagement/engagement.service";

export class FavoritesService {
  private readonly listingsRepo = new PrismaListingsRepository();

  constructor(private readonly repo: FavoritesRepository) {}

  async add(userId: string, listingId: string): Promise<{ listingId: string; favoritesCount: number; favorited: boolean }> {
    const listing = await this.listingsRepo.findById(listingId);
    if (!listing) {
      throw new AppError(404, "Listing not found", "NOT_FOUND");
    }
    await this.repo.upsert({ userId, listingId, createdAt: nowIso() });
    const favoritesCount = await this.syncFavoritesCounter(listingId);
    await trackEngagementEvent({
      eventType: "favorite",
      listingId,
      actorId: userId,
      metadata: { action: "add" },
    });
    return { listingId, favoritesCount, favorited: true };
  }

  async remove(userId: string, listingId: string): Promise<{ listingId: string; favoritesCount: number; favorited: boolean }> {
    const listing = await this.listingsRepo.findById(listingId);
    if (!listing) {
      throw new AppError(404, "Listing not found", "NOT_FOUND");
    }
    await this.repo.remove(userId, listingId);
    const favoritesCount = await this.syncFavoritesCounter(listingId);
    await trackEngagementEvent({
      eventType: "favorite",
      listingId,
      actorId: userId,
      metadata: { action: "remove" },
    });
    return { listingId, favoritesCount, favorited: false };
  }

  async list(userId: string): Promise<string[]> {
    const records = await this.repo.listByUser(userId);
    return records.map((record) => record.listingId);
  }

  private async syncFavoritesCounter(listingId: string): Promise<number> {
    const listing = await this.listingsRepo.findById(listingId);
    if (!listing) return 0;
    const count = await this.repo.countByListing(listingId);
    if (listing.favoritesCount !== count) {
      await this.listingsRepo.update(listingId, {
        ...listing,
        favoritesCount: count,
        updatedAt: nowIso(),
      });
    }
    return count;
  }
}

