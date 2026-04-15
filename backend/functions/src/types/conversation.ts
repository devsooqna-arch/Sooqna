import type { FirestoreDate } from "./firestore";
import type { MessageType } from "./enums";

export interface ParticipantSnapshot {
  fullName: string;
  photoURL: string;
}

export interface ListingSnapshot {
  title: string;
  primaryImageURL: string;
}

/**
 * `conversations/{conversationId}` — prefer auto-generated id; dedupe via Cloud Functions.
 */
export interface Conversation {
  participantIds: string[];
  participants: Record<string, ParticipantSnapshot>;
  listingId: string;
  listingSnapshot: ListingSnapshot;
  createdBy: string;
  lastMessageText: string;
  lastMessageSenderId: string;
  lastMessageAt: FirestoreDate;
  lastMessageType: MessageType;
  isActive: boolean;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}
