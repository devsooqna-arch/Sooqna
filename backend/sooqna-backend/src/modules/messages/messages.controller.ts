import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { logAuditEvent } from "../audit/audit.service";
import { PrismaMessagesRepository } from "./repositories/messages.repository";
import { MessagesService } from "./messages.service";

const service = new MessagesService(new PrismaMessagesRepository());

export async function createConversation(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const participantIds = Array.isArray(req.body?.participantIds)
    ? req.body.participantIds.map(String)
    : [uid];
  if (!participantIds.includes(uid)) {
    participantIds.push(uid);
  }

  const participants =
    req.body?.participants && typeof req.body.participants === "object"
      ? req.body.participants
      : {
          [uid]: {
            fullName: req.authUser?.name ?? "",
            photoURL: req.authUser?.picture ?? "",
          },
        };

  const conversation = await service.createConversation({
    participantIds,
    participants,
    listingId: String(req.body?.listingId ?? ""),
    listingSnapshot: {
      title: String(req.body?.listingSnapshot?.title ?? ""),
      primaryImageURL: String(req.body?.listingSnapshot?.primaryImageURL ?? ""),
    },
    createdBy: uid,
  });
  res.status(201).json({ success: true, conversation });
}

export async function createMessage(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const message = await service.createMessage({
    conversationId: req.params.conversationId,
    senderId: uid,
    type: (req.body?.type as "text" | "image" | "system") ?? "text",
    text: String(req.body?.text ?? ""),
    attachments: Array.isArray(req.body?.attachments) ? req.body.attachments : [],
  });
  await logAuditEvent({
    actorId: uid,
    action: "message.create",
    targetType: "conversation",
    targetId: req.params.conversationId,
    metadata: { messageId: message.id, type: message.type },
  });
  res.status(201).json({ success: true, message });
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const conversation = await service.getConversationForUser(req.params.conversationId, uid);
  if (!conversation) {
    throw new AppError(404, "Conversation not found", "NOT_FOUND");
    return;
  }
  res.json({ success: true, conversation });
}

export async function listConversations(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const conversations = await service.listUserConversations(uid);
  res.json({ success: true, conversations });
}

export async function getConversationMessages(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const messages = await service.getMessages(req.params.conversationId, uid);
  res.json({ success: true, messages });
}

export async function markConversationRead(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const updatedCount = await service.markConversationRead(req.params.conversationId, uid);
  await logAuditEvent({
    actorId: uid,
    action: "message.read",
    targetType: "conversation",
    targetId: req.params.conversationId,
    metadata: { updatedCount },
  });
  res.json({ success: true, updatedCount });
}

export async function getUnreadSummary(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const summary = await service.getUnreadSummary(uid);
  res.json({ success: true, ...summary });
}

