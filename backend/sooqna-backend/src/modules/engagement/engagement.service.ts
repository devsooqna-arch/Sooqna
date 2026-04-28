type EngagementEventType = "favorite" | "view" | "contact_intent";

type EngagementEventInput = {
  eventType: EngagementEventType;
  listingId?: string;
  conversationId?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
};

const inMemoryEvents: Array<EngagementEventInput & { createdAt: string }> = [];

export async function trackEngagementEvent(event: EngagementEventInput): Promise<void> {
  inMemoryEvents.push({
    ...event,
    createdAt: new Date().toISOString(),
  });
  if (inMemoryEvents.length > 500) {
    inMemoryEvents.shift();
  }
}

export function listRecentEngagementEvents(limit = 100): Array<EngagementEventInput & { createdAt: string }> {
  return inMemoryEvents.slice(-Math.max(1, Math.min(limit, 500))).reverse();
}
