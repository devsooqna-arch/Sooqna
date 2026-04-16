import * as fs from "node:fs";
import * as path from "node:path";

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readJsonArrayFile<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf8");
  if (!raw.trim()) {
    return [];
  }
  return JSON.parse(raw) as T[];
}

export function writeJsonArrayFile<T>(filePath: string, records: T[]): void {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2), "utf8");
}

