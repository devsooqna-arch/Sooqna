import { generateId } from "../../utils/ids";
import { nowIso } from "../../utils/time";
import type { MessagesRepository } from "./repositories/messages.repository";
import type { Conversation, Message, MessageType } from "./messages.types";

type CreateConversationInput = {
  participantIds: string[];
  participants: Conversation["participants"];
  listingId: string;
  listingSnapshot: Conversation["listingSnapshot"];
  createdBy: string;
};

type CreateMessageInput = {
  conversationId: string;
  senderId: string;
  type: MessageType;
  text: string;
  attachments?: unknown[];
};

export class MessagesService {
  constructor(private readonly repo: MessagesRepository) {}

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const now = nowIso();
    const conversation: Conversation = {
      id: generateId("conv"),
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
      createdAt: now,
      updatedAt: now,
    };
    return this.repo.createConversation(conversation);
  }

  async createMessage(input: CreateMessageInput): Promise<Message> {
    const now = nowIso();
    const conversation = await this.repo.findConversationById(input.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const message: Message = {
      id: generateId("msg"),
      conversationId: input.conversationId,
      senderId: input.senderId,
      type: input.type,
      text: input.text,
      attachments: input.attachments ?? [],
      isRead: false,
      readAt: null,
      createdAt: now,
      deletedAt: null,
    };

    await this.repo.createMessage(message);
    await this.repo.updateConversation({
      ...conversation,
      lastMessageText: input.text,
      lastMessageSenderId: input.senderId,
      lastMessageAt: now,
      lastMessageType: input.type,
      updatedAt: now,
    });

    return message;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.repo.findConversationById(id);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.repo.listMessages(conversationId);
  }
}

