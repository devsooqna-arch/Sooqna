import { apiClient } from "./apiClient";
import type { Conversation, Message } from "@/types/message";

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const response = await apiClient<{ success: boolean; conversation?: Conversation }>(
    `/messages/conversations/${conversationId}`,
    { method: "GET" }
  );
  return response.conversation ?? null;
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const response = await apiClient<{ success: true; messages: Message[] }>(
    `/messages/conversations/${conversationId}/messages`,
    { method: "GET" }
  );
  return response.messages;
}

