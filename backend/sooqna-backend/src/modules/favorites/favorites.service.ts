import { nowIso } from "../../utils/time";
import { AppError } from "../../shared/errors/appError";
import { PrismaListingsRepository } from "../listings/repositories/listings.repository";
import type { FavoritesRepository } from "./repositories/favorites.repository";

export class FavoritesService {
  private readonly listingsRepo = new PrismaListingsRepository();

  constructor(private readonly repo: FavoritesRepository) {}

  async add(userId: string, listingId: string): Promise<void> {
    const listing = await this.listingsRepo.findById(listingId);
    if (!listing) {
      throw new AppError(404, "Listing not found", "NOT_FOUND");
    }
    await this.repo.upsert({ userId, listingId, createdAt: nowIso() });
  }

  async remove(userId: string, listingId: string): Promise<void> {
    const listing = await this.listingsRepo.findById(listingId);
    if (!listing) {
      throw new AppError(404, "Listing not found", "NOT_FOUND");
    }
    await this.repo.remove(userId, listingId);
  }

  async list(userId: string): Promise<string[]> {
    const records = await this.repo.listByUser(userId);
    return records.map((record) => record.listingId);
  }
}

