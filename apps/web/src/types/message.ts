export type MessageType = "text" | "image" | "system";

export interface ConversationParticipant {
  fullName: string;
  photoURL: string;
}

export interface ConversationListingSnapshot {
  title: string;
  primaryImageURL: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: Record<string, ConversationParticipant>;
  listingId: string;
  listingSnapshot: ConversationListingSnapshot;
  createdBy: string;
  lastMessageText: string;
  lastMessageSenderId: string;
  lastMessageAt: string | null;
  lastMessageType: MessageType;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  type: MessageType;
  text: string;
  attachments: unknown[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string | null;
  deletedAt: string | null;
}

export interface CreateConversationInput {
  participantIds: string[];
  participants: Record<string, ConversationParticipant>;
  listingId: string;
  listingSnapshot: ConversationListingSnapshot;
  createdBy: string;
}

export interface CreateMessageInput {
  senderId: string;
  type: MessageType;
  text: string;
  attachments?: unknown[];
}

