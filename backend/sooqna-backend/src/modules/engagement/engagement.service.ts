import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { generateId } from "../../utils/ids";

type EngagementEventType = "favorite" | "view" | "contact_intent";

type EngagementEventInput = {
  eventType: EngagementEventType;
  listingId?: string;
  conversationId?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
};

export async function trackEngagementEvent(event: EngagementEventInput): Promise<void> {
  await prisma.engagementEvent.create({
    data: {
      id: generateId("eng"),
      eventType: event.eventType,
      listingId: event.listingId,
      conversationId: event.conversationId,
      actorId: event.actorId,
      metadata: (event.metadata ?? {}) as Prisma.InputJsonValue,
      createdAt: new Date(),
    },
  });
}

export async function listRecentEngagementEvents(
  limit = 100
): Promise<Array<EngagementEventInput & { createdAt: string }>> {
  const events = await prisma.engagementEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 500)),
  });
  return events.map((event) => ({
    eventType: event.eventType as EngagementEventType,
    listingId: event.listingId ?? undefined,
    conversationId: event.conversationId ?? undefined,
    actorId: event.actorId ?? undefined,
    metadata: (event.metadata ?? {}) as Record<string, unknown>,
    createdAt: event.createdAt.toISOString(),
  }));
}
