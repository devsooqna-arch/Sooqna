import { Router } from "express";
import * as path from "node:path";
import * as fs from "node:fs";
import { readJsonArrayFile } from "../utils/fileStore";
import {
  PrismaCategoriesRepository,
  type CategoryRecord,
} from "../modules/categories/categories.repository";

function toBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value !== "string") return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return defaultValue;
}

export const categoriesRouter = Router();
const categoriesRepo = new PrismaCategoriesRepository();
const categoriesFilePath = path.resolve(
  process.cwd(),
  "src/modules/categories/repositories/categories.data.json"
);

async function ensureSeededIfEmpty(): Promise<void> {
  const existing = await categoriesRepo.list(false);
  if (existing.length) return;
  if (process.env.NODE_ENV === "production") return;
  if (!fs.existsSync(categoriesFilePath)) return;
  const seedRecords = readJsonArrayFile<CategoryRecord>(categoriesFilePath);
  if (!seedRecords.length) return;
  await categoriesRepo.upsertMany(seedRecords);
}

categoriesRouter.get("/", async (req, res) => {
  const activeOnly = toBoolean(req.query.activeOnly, true);
  try {
    await ensureSeededIfEmpty();
    const data = await categoriesRepo.list(activeOnly);
    res.json({ success: true, data });
    return;
  } catch {
    // Dev fallback: if DB is unavailable, keep categories endpoint usable from local JSON.
    if (!fs.existsSync(categoriesFilePath)) {
      res.status(503).json({ success: false, message: "Categories storage unavailable." });
      return;
    }
    const records = readJsonArrayFile<CategoryRecord>(categoriesFilePath);
    const data = records
      .filter((category) => (activeOnly ? category.isActive : true))
      .sort((a, b) => a.sortOrder - b.sortOrder);
    res.json({ success: true, data });
    return;
  }

});

