import * as path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "../../../utils/fileStore";
import type { Listing } from "../listings.types";

export interface ListingsRepository {
  create(listing: Listing): Promise<Listing>;
  list(): Promise<Listing[]>;
  findById(id: string): Promise<Listing | null>;
  update(id: string, listing: Listing): Promise<Listing>;
}

const dbPath = path.resolve(
  process.cwd(),
  "src/modules/listings/repositories/listings.data.json"
);

export class FileListingsRepository implements ListingsRepository {
  async create(listing: Listing): Promise<Listing> {
    const items = readJsonArrayFile<Listing>(dbPath);
    items.push(listing);
    writeJsonArrayFile(dbPath, items);
    return listing;
  }

  async list(): Promise<Listing[]> {
    const items = readJsonArrayFile<Listing>(dbPath);
    return items.filter((item) => !item.deletedAt);
  }

  async findById(id: string): Promise<Listing | null> {
    const items = readJsonArrayFile<Listing>(dbPath);
    return items.find((item) => item.id === id && !item.deletedAt) ?? null;
  }

  async update(id: string, listing: Listing): Promise<Listing> {
    const items = readJsonArrayFile<Listing>(dbPath);
    const idx = items.findIndex((item) => item.id === id);
    if (idx < 0) {
      throw new Error("Listing not found.");
    }
    items[idx] = listing;
    writeJsonArrayFile(dbPath, items);
    return listing;
  }
}

