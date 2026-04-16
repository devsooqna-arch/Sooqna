import * as path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "../../../utils/fileStore";
import type { FavoriteRecord } from "../favorites.types";

export interface FavoritesRepository {
  listByUser(userId: string): Promise<FavoriteRecord[]>;
  upsert(record: FavoriteRecord): Promise<void>;
  remove(userId: string, listingId: string): Promise<void>;
}

const dbPath = path.resolve(
  process.cwd(),
  "src/modules/favorites/repositories/favorites.data.json"
);

export class FileFavoritesRepository implements FavoritesRepository {
  async listByUser(userId: string): Promise<FavoriteRecord[]> {
    const items = readJsonArrayFile<FavoriteRecord>(dbPath);
    return items.filter((item) => item.userId === userId);
  }

  async upsert(record: FavoriteRecord): Promise<void> {
    const items = readJsonArrayFile<FavoriteRecord>(dbPath);
    const idx = items.findIndex(
      (item) => item.userId === record.userId && item.listingId === record.listingId
    );
    if (idx >= 0) items[idx] = record;
    else items.push(record);
    writeJsonArrayFile(dbPath, items);
  }

  async remove(userId: string, listingId: string): Promise<void> {
    const items = readJsonArrayFile<FavoriteRecord>(dbPath);
    const next = items.filter(
      (item) => !(item.userId === userId && item.listingId === listingId)
    );
    writeJsonArrayFile(dbPath, next);
  }
}

