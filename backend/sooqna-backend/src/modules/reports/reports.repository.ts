import { prisma } from "../../config/prisma";
import type { ModerationReport, ReportStatus } from "./reports.types";

export interface ReportsRepository {
  create(report: ModerationReport): Promise<ModerationReport>;
  list(filters?: { status?: ReportStatus }): Promise<ModerationReport[]>;
  findById(id: string): Promise<ModerationReport | null>;
  update(report: ModerationReport): Promise<ModerationReport>;
}

export class PrismaReportsRepository implements ReportsRepository {
  async create(report: ModerationReport): Promise<ModerationReport> {
    await prisma.report.create({
      data: {
        id: report.id,
        targetType: report.targetType,
        targetId: report.targetId,
        reasonCode: report.reasonCode,
        details: report.details,
        reporterId: report.reporterId,
        status: report.status,
        moderatorId: report.moderatorId,
        moderatorNote: report.moderatorNote,
        createdAt: new Date(report.createdAt),
        updatedAt: new Date(report.updatedAt),
      },
    });
    return report;
  }

  async list(filters?: { status?: ReportStatus }): Promise<ModerationReport[]> {
    const reports = await prisma.report.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return reports.map((report) => ({
      id: report.id,
      targetType: report.targetType as ModerationReport["targetType"],
      targetId: report.targetId,
      reasonCode: report.reasonCode as ModerationReport["reasonCode"],
      details: report.details,
      reporterId: report.reporterId,
      status: report.status as ReportStatus,
      moderatorId: report.moderatorId,
      moderatorNote: report.moderatorNote,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    }));
  }

  async findById(id: string): Promise<ModerationReport | null> {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return null;
    return {
      id: report.id,
      targetType: report.targetType as ModerationReport["targetType"],
      targetId: report.targetId,
      reasonCode: report.reasonCode as ModerationReport["reasonCode"],
      details: report.details,
      reporterId: report.reporterId,
      status: report.status as ReportStatus,
      moderatorId: report.moderatorId,
      moderatorNote: report.moderatorNote,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };
  }

  async update(report: ModerationReport): Promise<ModerationReport> {
    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: report.status,
        moderatorId: report.moderatorId,
        moderatorNote: report.moderatorNote,
        updatedAt: new Date(report.updatedAt),
      },
    });
    return report;
  }
}
