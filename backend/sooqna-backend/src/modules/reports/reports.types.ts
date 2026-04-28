export type ReportTargetType = "listing" | "message" | "user";
export type ReportReasonCode = "spam" | "abuse" | "fraud" | "inappropriate" | "other";
export type ReportStatus = "open" | "in_review" | "resolved" | "rejected";

export interface ModerationReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reasonCode: ReportReasonCode;
  details: string;
  reporterId: string;
  status: ReportStatus;
  moderatorId: string | null;
  moderatorNote: string | null;
  createdAt: string;
  updatedAt: string;
}
