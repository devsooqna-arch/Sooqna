import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Conversation,
  CreateConversationInput,
  CreateMessageInput,
  Message,
} from "@/types/message";

const conversationsRef = collection(db, "conversations");

function mapConversation(
  snapshot: QueryDocumentSnapshot<DocumentData>
): Conversation {
  const data = snapshot.data() as Omit<Conversation, "id"> & Record<string, unknown>;

  const participantsRaw = data.participants as Record<string, unknown> | undefined;
  const participants: Conversation["participants"] = {};
  if (participantsRaw && typeof participantsRaw === "object") {
    for (const [userId, value] of Object.entries(participantsRaw)) {
      const participant = value as Record<string, unknown>;
      participants[userId] = {
        fullName: String(participant?.fullName ?? ""),
        photoURL: String(participant?.photoURL ?? ""),
      };
    }
  }

  return {
    id: snapshot.id,
    participantIds: Array.isArray(data.participantIds)
      ? data.participantIds.map((id) => String(id))
      : [],
    participants,
    listingId: String(data.listingId ?? ""),
    listingSnapshot: {
      title: String(data.listingSnapshot?.title ?? ""),
      primaryImageURL: String(data.listingSnapshot?.primaryImageURL ?? ""),
    },
    createdBy: String(data.createdBy ?? ""),
    lastMessageText: String(data.lastMessageText ?? ""),
    lastMessageSenderId: String(data.lastMessageSenderId ?? ""),
    lastMessageAt: (data.lastMessageAt as Conversation["lastMessageAt"]) ?? null,
    lastMessageType: (data.lastMessageType as Conversation["lastMessageType"]) ?? "text",
    isActive: Boolean(data.isActive ?? true),
    createdAt: (data.createdAt as Conversation["createdAt"]) ?? null,
    updatedAt: (data.updatedAt as Conversation["updatedAt"]) ?? null,
  };
}

function mapMessage(snapshot: QueryDocumentSnapshot<DocumentData>): Message {
  const data = snapshot.data() as Omit<Message, "id"> & Record<string, unknown>;
  return {
    id: snapshot.id,
    senderId: String(data.senderId ?? ""),
    type: (data.type as Message["type"]) ?? "text",
    text: String(data.text ?? ""),
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
    isRead: Boolean(data.isRead),
    readAt: (data.readAt as Message["readAt"]) ?? null,
    createdAt: (data.createdAt as Message["createdAt"]) ?? null,
    deletedAt: (data.deletedAt as Message["deletedAt"]) ?? null,
  };
}

/**
 * Fetch one conversation document by id.
 */
export async function getConversationById(
  conversationId: string
): Promise<Conversation | null> {
  const ref = doc(db, "conversations", conversationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  return mapConversation(snap as QueryDocumentSnapshot<DocumentData>);
}

/**
 * Fetch conversation messages ordered by oldest -> newest.
 */
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const messagesRef = collection(db, "conversations", conversationId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapMessage);
}

/**
 * Create a new conversation with base milestone fields.
 * Returns the new conversation document id.
 */
export async function createConversation(
  input: CreateConversationInput
): Promise<{ conversationId: string }> {
  const newDoc = await addDoc(conversationsRef, {
    participantIds: input.participantIds,
    participants: input.participants,
    listingId: input.listingId,
    listingSnapshot: input.listingSnapshot,
    createdBy: input.createdBy,
    lastMessageText: "",
    lastMessageSenderId: "",
    lastMessageAt: null,
    lastMessageType: "text",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { conversationId: newDoc.id };
}

/**
 * Create a message in messages subcollection and sync last-message
 * summary fields on parent conversation.
 */
export async function createMessage(
  conversationId: string,
  input: CreateMessageInput
): Promise<{ messageId: string }> {
  const conversationDocRef = doc(db, "conversations", conversationId);
  const messagesRef = collection(db, "conversations", conversationId, "messages");

  const messageDoc = await addDoc(messagesRef, {
    senderId: input.senderId,
    type: input.type,
    text: input.text,
    attachments: input.attachments ?? [],
    isRead: false,
    readAt: null,
    createdAt: serverTimestamp(),
    deletedAt: null,
  });

  await updateDoc(conversationDocRef, {
    lastMessageText: input.text,
    lastMessageSenderId: input.senderId,
    lastMessageAt: serverTimestamp(),
    lastMessageType: input.type,
    updatedAt: serverTimestamp(),
  });

  return { messageId: messageDoc.id };
}

