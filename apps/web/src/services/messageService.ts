import { apiFetch } from "@/services/apiClient";
import type {
  Conversation,
  CreateConversationInput,
  CreateMessageInput,
  Message,
} from "@/types/message";

export async function getConversationById(
  conversationId: string
): Promise<Conversation | null> {
  try {
    const response = await apiFetch<{ success: true; conversation: Conversation }>(
      `/messages/conversations/${conversationId}`
    );
    return response.conversation;
  } catch {
    return null;
  }
}

export async function getMyConversations(): Promise<Conversation[]> {
  const response = await apiFetch<{ success: true; conversations: Conversation[] }>(
    "/messages/conversations",
    {
      authenticated: true,
    }
  );
  return response.conversations;
}

export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const response = await apiFetch<{ success: true; messages: Message[] }>(
    `/messages/conversations/${conversationId}/messages`
  );
  return response.messages;
}

export async function createConversation(
  input: CreateConversationInput
): Promise<{ conversationId: string }> {
  const response = await apiFetch<{ success: true; conversation: Conversation }>(
    "/messages/conversations",
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(input),
    }
  );

  return { conversationId: response.conversation.id };
}

export async function createMessage(
  conversationId: string,
  input: CreateMessageInput
): Promise<{ messageId: string }> {
  const response = await apiFetch<{ success: true; message: Message }>(
    `/messages/conversations/${conversationId}/messages`,
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify({
        type: input.type,
        text: input.text,
        attachments: input.attachments ?? [],
      }),
    }
  );
  return { messageId: response.message.id };
}

