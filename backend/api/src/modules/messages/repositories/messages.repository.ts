import * as path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "../../../utils/fileStore";
import type { Conversation, Message } from "../messages.types";

export interface MessagesRepository {
  createConversation(conversation: Conversation): Promise<Conversation>;
  findConversationById(id: string): Promise<Conversation | null>;
  updateConversation(conversation: Conversation): Promise<Conversation>;
  createMessage(message: Message): Promise<Message>;
  listMessages(conversationId: string): Promise<Message[]>;
}

const conversationsPath = path.resolve(
  process.cwd(),
  "src/modules/messages/repositories/conversations.data.json"
);
const messagesPath = path.resolve(
  process.cwd(),
  "src/modules/messages/repositories/messages.data.json"
);

export class FileMessagesRepository implements MessagesRepository {
  async createConversation(conversation: Conversation): Promise<Conversation> {
    const items = readJsonArrayFile<Conversation>(conversationsPath);
    items.push(conversation);
    writeJsonArrayFile(conversationsPath, items);
    return conversation;
  }

  async findConversationById(id: string): Promise<Conversation | null> {
    const items = readJsonArrayFile<Conversation>(conversationsPath);
    return items.find((item) => item.id === id) ?? null;
  }

  async updateConversation(conversation: Conversation): Promise<Conversation> {
    const items = readJsonArrayFile<Conversation>(conversationsPath);
    const idx = items.findIndex((item) => item.id === conversation.id);
    if (idx < 0) throw new Error("Conversation not found");
    items[idx] = conversation;
    writeJsonArrayFile(conversationsPath, items);
    return conversation;
  }

  async createMessage(message: Message): Promise<Message> {
    const items = readJsonArrayFile<Message>(messagesPath);
    items.push(message);
    writeJsonArrayFile(messagesPath, items);
    return message;
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    const items = readJsonArrayFile<Message>(messagesPath);
    return items
      .filter((item) => item.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}

