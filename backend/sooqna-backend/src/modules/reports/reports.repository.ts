import * as path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "../../utils/fileStore";
import type { ModerationReport, ReportStatus } from "./reports.types";

const reportsDataPath = path.resolve(
  process.cwd(),
  "src/modules/reports/reports.data.json"
);

export interface ReportsRepository {
  create(report: ModerationReport): Promise<ModerationReport>;
  list(filters?: { status?: ReportStatus }): Promise<ModerationReport[]>;
  findById(id: string): Promise<ModerationReport | null>;
  update(report: ModerationReport): Promise<ModerationReport>;
}

export class JsonReportsRepository implements ReportsRepository {
  async create(report: ModerationReport): Promise<ModerationReport> {
    const items = readJsonArrayFile<ModerationReport>(reportsDataPath);
    items.push(report);
    writeJsonArrayFile(reportsDataPath, items);
    return report;
  }

  async list(filters?: { status?: ReportStatus }): Promise<ModerationReport[]> {
    const items = readJsonArrayFile<ModerationReport>(reportsDataPath);
    const filtered = filters?.status ? items.filter((item) => item.status === filters.status) : items;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<ModerationReport | null> {
    const items = readJsonArrayFile<ModerationReport>(reportsDataPath);
    return items.find((item) => item.id === id) ?? null;
  }

  async update(report: ModerationReport): Promise<ModerationReport> {
    const items = readJsonArrayFile<ModerationReport>(reportsDataPath);
    const idx = items.findIndex((item) => item.id === report.id);
    if (idx < 0) throw new Error("Report not found");
    items[idx] = report;
    writeJsonArrayFile(reportsDataPath, items);
    return report;
  }
}
