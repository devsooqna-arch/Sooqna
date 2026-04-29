import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { AuditLogEntry } from "./audit.types";

export interface AuditRepository {
  append(entry: AuditLogEntry): Promise<void>;
  list(limit: number): Promise<AuditLogEntry[]>;
}

export class PrismaAuditRepository implements AuditRepository {
  async append(entry: AuditLogEntry): Promise<void> {
    await prisma.auditLog.create({
      data: {
        id: entry.id,
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata as Prisma.InputJsonValue,
        createdAt: new Date(entry.createdAt),
      },
    });

    const total = await prisma.auditLog.count();
    if (total > 5000) {
      const toDelete = await prisma.auditLog.findMany({
        orderBy: { createdAt: "asc" },
        take: total - 5000,
        select: { id: true },
      });
      if (toDelete.length > 0) {
        await prisma.auditLog.deleteMany({
          where: { id: { in: toDelete.map((item) => item.id) } },
        });
      }
    }
  }

  async list(limit: number): Promise<AuditLogEntry[]> {
    const rows = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.max(1, Math.min(limit, 500)),
    });
    return rows.map((item) => ({
      id: item.id,
      actorId: item.actorId,
      action: item.action as AuditLogEntry["action"],
      targetType: item.targetType,
      targetId: item.targetId,
      metadata: (item.metadata ?? {}) as Record<string, unknown>,
      createdAt: item.createdAt.toISOString(),
    }));
  }
}
