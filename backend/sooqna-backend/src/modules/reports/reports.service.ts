import { generateId } from "../../utils/ids";
import { nowIso } from "../../utils/time";
import { AppError } from "../../shared/errors/appError";
import type { ReportsRepository } from "./reports.repository";
import type {
  ModerationReport,
  ReportReasonCode,
  ReportStatus,
  ReportTargetType,
} from "./reports.types";

export class ReportsService {
  constructor(private readonly repo: ReportsRepository) {}

  async submit(input: {
    targetType: ReportTargetType;
    targetId: string;
    reasonCode: ReportReasonCode;
    details?: string;
    reporterId: string;
  }): Promise<ModerationReport> {
    if (!input.targetId.trim()) {
      throw new AppError(400, "targetId is required", "VALIDATION_ERROR");
    }
    const now = nowIso();
    const report: ModerationReport = {
      id: generateId("rpt"),
      targetType: input.targetType,
      targetId: input.targetId.trim(),
      reasonCode: input.reasonCode,
      details: input.details?.trim() ?? "",
      reporterId: input.reporterId,
      status: "open",
      moderatorId: null,
      moderatorNote: null,
      createdAt: now,
      updatedAt: now,
    };
    return this.repo.create(report);
  }

  async listQueue(status?: ReportStatus): Promise<ModerationReport[]> {
    return this.repo.list({ status });
  }

  async updateStatus(input: {
    reportId: string;
    status: ReportStatus;
    moderatorId: string;
    note?: string;
  }): Promise<ModerationReport> {
    const report = await this.repo.findById(input.reportId);
    if (!report) throw new AppError(404, "Report not found", "NOT_FOUND");
    const next: ModerationReport = {
      ...report,
      status: input.status,
      moderatorId: input.moderatorId,
      moderatorNote: input.note?.trim() || null,
      updatedAt: nowIso(),
    };
    return this.repo.update(next);
  }
}
