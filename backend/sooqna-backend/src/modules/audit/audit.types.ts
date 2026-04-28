export type AuditAction =
  | "listing.create"
  | "listing.update"
  | "listing.publish"
  | "listing.unpublish"
  | "listing.renew"
  | "listing.expire"
  | "listing.delete"
  | "favorite.add"
  | "favorite.remove"
  | "message.create"
  | "message.read"
  | "report.submit"
  | "report.update"
  | "security.content_blocked";

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  action: AuditAction;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
