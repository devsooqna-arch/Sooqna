import type { FirestoreDate } from "./firestore";
import type { MessageType } from "./enums";

export interface MessageAttachment {
  url: string;
  path?: string;
  mimeType?: string;
}

/**
 * `conversations/{conversationId}/messages/{messageId}`
 */
export interface Message {
  senderId: string;
  type: MessageType;
  text: string;
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt: FirestoreDate;
  createdAt: FirestoreDate;
  deletedAt: FirestoreDate;
}
