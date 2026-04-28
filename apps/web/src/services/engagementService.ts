import { apiFetch } from "@/services/apiClient";

export type EngagementEventType = "favorite" | "view" | "contact_intent";

export async function trackEngagementEvent(
  eventType: EngagementEventType,
  payload?: {
    listingId?: string;
    conversationId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await apiFetch<{ success: true }>("/engagement/events", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify({
      eventType,
      listingId: payload?.listingId,
      conversationId: payload?.conversationId,
      metadata: payload?.metadata,
    }),
  });
}
