import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { logAuditEvent } from "../audit/audit.service";
import { PrismaReportsRepository } from "./reports.repository";
import { ReportsService } from "./reports.service";
import type { ReportStatus } from "./reports.types";

const service = new ReportsService(new PrismaReportsRepository());

export async function submitReport(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  const report = await service.submit({
    targetType: req.body.targetType,
    targetId: req.body.targetId,
    reasonCode: req.body.reasonCode,
    details: req.body.details,
    reporterId: uid,
  });
  await logAuditEvent({
    actorId: uid,
    action: "report.submit",
    targetType: report.targetType,
    targetId: report.targetId,
    metadata: { reportId: report.id, reasonCode: report.reasonCode },
  });
  res.status(201).json({ success: true, report });
}

export async function listModerationQueue(req: Request, res: Response): Promise<void> {
  const status =
    req.query.status === "open" ||
    req.query.status === "in_review" ||
    req.query.status === "resolved" ||
    req.query.status === "rejected"
      ? (req.query.status as ReportStatus)
      : undefined;
  const reports = await service.listQueue(status);
  res.json({ success: true, reports });
}

export async function updateModerationReport(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  const report = await service.updateStatus({
    reportId: req.params.id,
    status: req.body.status,
    moderatorId: uid,
    note: req.body.note,
  });
  await logAuditEvent({
    actorId: uid,
    action: "report.update",
    targetType: report.targetType,
    targetId: report.targetId,
    metadata: { reportId: report.id, status: report.status },
  });
  res.json({ success: true, report });
}
