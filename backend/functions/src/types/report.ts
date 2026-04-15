import type { FirestoreDate } from "./firestore";
import type { ReportReason, ReportStatus, ReportTargetType } from "./enums";

/**
 * `reports/{reportId}`
 */
export interface Report {
  targetType: ReportTargetType;
  targetId: string;
  reportedBy: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}
