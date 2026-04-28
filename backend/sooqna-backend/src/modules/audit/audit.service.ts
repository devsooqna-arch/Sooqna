import { generateId } from "../../utils/ids";
import { nowIso } from "../../utils/time";
import { JsonAuditRepository } from "./audit.repository";
import type { AuditAction, AuditLogEntry } from "./audit.types";

const repo = new JsonAuditRepository();

export async function logAuditEvent(input: {
  actorId?: string | null;
  action: AuditAction;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const entry: AuditLogEntry = {
    id: generateId("aud"),
    actorId: input.actorId ?? null,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
    createdAt: nowIso(),
  };
  await repo.append(entry);
}

export async function getRecentAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
  return repo.list(limit);
}
