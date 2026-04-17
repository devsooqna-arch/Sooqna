import { nowIso } from "../../utils/time";
import type { FavoritesRepository } from "./repositories/favorites.repository";

export class FavoritesService {
  constructor(private readonly repo: FavoritesRepository) {}

  async add(userId: string, listingId: string): Promise<void> {
    await this.repo.upsert({ userId, listingId, createdAt: nowIso() });
  }

  async remove(userId: string, listingId: string): Promise<void> {
    await this.repo.remove(userId, listingId);
  }

  async list(userId: string): Promise<string[]> {
    const records = await this.repo.listByUser(userId);
    return records.map((record) => record.listingId);
  }
}

