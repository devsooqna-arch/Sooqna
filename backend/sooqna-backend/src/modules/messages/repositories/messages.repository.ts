import * as path from "node:path";
import { env } from "../../../config/env";
import { prisma } from "../../../config/prisma";
import { parseIso, toIso } from "../../../shared/utils/dates";
import { readJsonArrayFile, writeJsonArrayFile } from "../../../utils/fileStore";
import type { Conversation, Message } from "../messages.types";
import type { Prisma } from "@prisma/client";

export interface MessagesRepository {
  createConversation(conversation: Conversation): Promise<Conversation>;
  findConversationById(id: string): Promise<Conversation | null>;
  listConversationsForUser(userId: string): Promise<Conversation[]>;
  updateConversation(conversation: Conversation): Promise<Conversation>;
  createMessage(message: Message): Promise<Message>;
  listMessages(conversationId: string): Promise<Message[]>;
}

const conversationsDataPath = path.resolve(
  process.cwd(),
  "src/modules/messages/repositories/conversations.data.json"
);
const messagesDataPath = path.resolve(
  process.cwd(),
  "src/modules/messages/repositories/messages.data.json"
);

function useJsonFallback(): boolean {
  return env.enableCategoriesJsonFallback === "true";
}

export class PrismaMessagesRepository implements MessagesRepository {
  async createConversation(conversation: Conversation): Promise<Conversation> {
    try {
      const created = await prisma.conversation.create({
        data: {
          id: conversation.id,
          listingId: conversation.listingId,
          listingSnapshotTitle: conversation.listingSnapshot.title,
          listingSnapshotPrimaryImageURL: conversation.listingSnapshot.primaryImageURL,
          createdBy: conversation.createdBy,
          lastMessageText: conversation.lastMessageText,
          lastMessageSenderId: conversation.lastMessageSenderId,
          lastMessageAt: parseIso(conversation.lastMessageAt),
          lastMessageType: conversation.lastMessageType,
          isActive: conversation.isActive,
          createdAt: new Date(conversation.createdAt),
          updatedAt: new Date(conversation.updatedAt),
          participants: {
            create: conversation.participantIds.map((participantId) => ({
              userId: participantId,
              fullName: conversation.participants[participantId]?.fullName ?? "",
              photoURL: conversation.participants[participantId]?.photoURL ?? "",
            })),
          },
        },
        include: { participants: true },
      });

      const participants: Conversation["participants"] = {};
      for (const participant of created.participants) {
        participants[participant.userId] = {
          fullName: participant.fullName,
          photoURL: participant.photoURL,
        };
      }

      return {
        id: created.id,
        participantIds: created.participants.map((p) => p.userId),
        participants,
        listingId: created.listingId,
        listingSnapshot: {
          title: created.listingSnapshotTitle,
          primaryImageURL: created.listingSnapshotPrimaryImageURL,
        },
        createdBy: created.createdBy,
        lastMessageText: created.lastMessageText,
        lastMessageSenderId: created.lastMessageSenderId,
        lastMessageAt: toIso(created.lastMessageAt),
        lastMessageType: created.lastMessageType as Conversation["lastMessageType"],
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (error) {
      if (useJsonFallback()) {
        const conversations = readJsonArrayFile<Conversation>(conversationsDataPath);
        conversations.push(conversation);
        writeJsonArrayFile(conversationsDataPath, conversations);
        return conversation;
      }
      throw new Error("Failed to create conversation.", { cause: error });
    }
  }

  async findConversationById(id: string): Promise<Conversation | null> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: { participants: true },
      });
      if (!conversation) return null;

      const participants: Conversation["participants"] = {};
      for (const participant of conversation.participants) {
        participants[participant.userId] = {
          fullName: participant.fullName,
          photoURL: participant.photoURL,
        };
      }

      return {
        id: conversation.id,
        participantIds: conversation.participants.map((p) => p.userId),
        participants,
        listingId: conversation.listingId,
        listingSnapshot: {
          title: conversation.listingSnapshotTitle,
          primaryImageURL: conversation.listingSnapshotPrimaryImageURL,
        },
        createdBy: conversation.createdBy,
        lastMessageText: conversation.lastMessageText,
        lastMessageSenderId: conversation.lastMessageSenderId,
        lastMessageAt: toIso(conversation.lastMessageAt),
        lastMessageType: conversation.lastMessageType as Conversation["lastMessageType"],
        isActive: conversation.isActive,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      };
    } catch (error) {
      if (useJsonFallback()) {
        const conversations = readJsonArrayFile<Conversation>(conversationsDataPath);
        return conversations.find((conversation) => conversation.id === id) ?? null;
      }
      throw new Error("Failed to fetch conversation.", { cause: error });
    }
  }

  async listConversationsForUser(userId: string): Promise<Conversation[]> {
    try {
      const items = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        include: { participants: true },
        orderBy: { updatedAt: "desc" },
      });

      return items.map((conversation) => {
        const participants: Conversation["participants"] = {};
        for (const participant of conversation.participants) {
          participants[participant.userId] = {
            fullName: participant.fullName,
            photoURL: participant.photoURL,
          };
        }

        return {
          id: conversation.id,
          participantIds: conversation.participants.map((p) => p.userId),
          participants,
          listingId: conversation.listingId,
          listingSnapshot: {
            title: conversation.listingSnapshotTitle,
            primaryImageURL: conversation.listingSnapshotPrimaryImageURL,
          },
          createdBy: conversation.createdBy,
          lastMessageText: conversation.lastMessageText,
          lastMessageSenderId: conversation.lastMessageSenderId,
          lastMessageAt: toIso(conversation.lastMessageAt),
          lastMessageType: conversation.lastMessageType as Conversation["lastMessageType"],
          isActive: conversation.isActive,
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString(),
        };
      });
    } catch (error) {
      if (useJsonFallback()) {
        const conversations = readJsonArrayFile<Conversation>(conversationsDataPath);
        return conversations
          .filter((conversation) => conversation.participantIds.includes(userId))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      }
      throw new Error("Failed to list conversations.", { cause: error });
    }
  }

  async updateConversation(conversation: Conversation): Promise<Conversation> {
    try {
      const updated = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          listingId: conversation.listingId,
          listingSnapshotTitle: conversation.listingSnapshot.title,
          listingSnapshotPrimaryImageURL: conversation.listingSnapshot.primaryImageURL,
          createdBy: conversation.createdBy,
          lastMessageText: conversation.lastMessageText,
          lastMessageSenderId: conversation.lastMessageSenderId,
          lastMessageAt: parseIso(conversation.lastMessageAt),
          lastMessageType: conversation.lastMessageType,
          isActive: conversation.isActive,
          createdAt: new Date(conversation.createdAt),
          updatedAt: new Date(conversation.updatedAt),
        },
      });
      return {
        ...conversation,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (error) {
      if (useJsonFallback()) {
        const conversations = readJsonArrayFile<Conversation>(conversationsDataPath);
        const idx = conversations.findIndex((item) => item.id === conversation.id);
        if (idx < 0) throw new Error("Conversation not found");
        conversations[idx] = conversation;
        writeJsonArrayFile(conversationsDataPath, conversations);
        return conversation;
      }
      throw new Error("Conversation not found.", { cause: error });
    }
  }

  async createMessage(message: Message): Promise<Message> {
    try {
      const created = await prisma.message.create({
        data: {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          type: message.type,
          text: message.text,
          attachments: message.attachments as Prisma.InputJsonValue,
          isRead: message.isRead,
          readAt: parseIso(message.readAt),
          createdAt: new Date(message.createdAt),
          deletedAt: parseIso(message.deletedAt),
        },
      });
      return {
        id: created.id,
        conversationId: created.conversationId,
        senderId: created.senderId,
        type: created.type as Message["type"],
        text: created.text,
        attachments: Array.isArray(created.attachments) ? created.attachments : [],
        isRead: created.isRead,
        readAt: toIso(created.readAt),
        createdAt: created.createdAt.toISOString(),
        deletedAt: toIso(created.deletedAt),
      };
    } catch (error) {
      if (useJsonFallback()) {
        const messages = readJsonArrayFile<Message>(messagesDataPath);
        messages.push(message);
        writeJsonArrayFile(messagesDataPath, messages);
        return message;
      }
      throw new Error("Failed to create message.", { cause: error });
    }
  }

  async listMessages(conversationId: string): Promise<Message[]> {
    try {
      const items = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
      });
      return items.map((item) => ({
        id: item.id,
        conversationId: item.conversationId,
        senderId: item.senderId,
        type: item.type as Message["type"],
        text: item.text,
        attachments: Array.isArray(item.attachments) ? item.attachments : [],
        isRead: item.isRead,
        readAt: toIso(item.readAt),
        createdAt: item.createdAt.toISOString(),
        deletedAt: toIso(item.deletedAt),
      }));
    } catch (error) {
      if (useJsonFallback()) {
        const items = readJsonArrayFile<Message>(messagesDataPath);
        return items
          .filter((item) => item.conversationId === conversationId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      }
      throw new Error("Failed to list messages.", { cause: error });
    }
  }
}

