import { randomBytes } from "node:crypto";

export function generateId(prefix?: string): string {
  const value = `${Date.now()}_${randomBytes(6).toString("hex")}`;
  return prefix ? `${prefix}_${value}` : value;
}

