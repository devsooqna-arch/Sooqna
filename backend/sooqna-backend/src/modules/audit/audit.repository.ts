import * as path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "../../utils/fileStore";
import type { AuditLogEntry } from "./audit.types";

const auditDataPath = path.resolve(process.cwd(), "src/modules/audit/audit.data.json");

export interface AuditRepository {
  append(entry: AuditLogEntry): Promise<void>;
  list(limit: number): Promise<AuditLogEntry[]>;
}

export class JsonAuditRepository implements AuditRepository {
  async append(entry: AuditLogEntry): Promise<void> {
    const items = readJsonArrayFile<AuditLogEntry>(auditDataPath);
    items.push(entry);
    const trimmed = items.slice(-5000);
    writeJsonArrayFile(auditDataPath, trimmed);
  }

  async list(limit: number): Promise<AuditLogEntry[]> {
    const items = readJsonArrayFile<AuditLogEntry>(auditDataPath);
    return items.slice(-Math.max(1, Math.min(limit, 500))).reverse();
  }
}
