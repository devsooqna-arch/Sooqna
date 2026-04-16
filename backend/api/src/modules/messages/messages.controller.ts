import type { Request, Response } from "express";
import { FileMessagesRepository } from "./repositories/messages.repository";
import { MessagesService } from "./messages.service";

const service = new MessagesService(new FileMessagesRepository());

export async function createConversation(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const conversation = await service.createConversation({
      participantIds: Array.isArray(req.body?.participantIds)
        ? req.body.participantIds.map(String)
        : [uid],
      participants:
        req.body?.participants && typeof req.body.participants === "object"
          ? req.body.participants
          : {
              [uid]: {
                fullName: req.authUser?.name ?? "",
                photoURL: req.authUser?.picture ?? "",
              },
            },
      listingId: String(req.body?.listingId ?? ""),
      listingSnapshot: {
        title: String(req.body?.listingSnapshot?.title ?? ""),
        primaryImageURL: String(req.body?.listingSnapshot?.primaryImageURL ?? ""),
      },
      createdBy: uid,
    });
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    res.status(400).json({ success: false, message: String((error as Error).message) });
  }
}

export async function createMessage(req: Request, res: Response): Promise<void> {
  const uid = req.authUser?.uid;
  if (!uid) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const message = await service.createMessage({
      conversationId: req.params.conversationId,
      senderId: uid,
      type: (req.body?.type as "text" | "image" | "system") ?? "text",
      text: String(req.body?.text ?? ""),
      attachments: Array.isArray(req.body?.attachments) ? req.body.attachments : [],
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(400).json({ success: false, message: String((error as Error).message) });
  }
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  const conversation = await service.getConversation(req.params.conversationId);
  if (!conversation) {
    res.status(404).json({ success: false, message: "Conversation not found" });
    return;
  }
  res.json({ success: true, conversation });
}

export async function getConversationMessages(req: Request, res: Response): Promise<void> {
  const messages = await service.getMessages(req.params.conversationId);
  res.json({ success: true, messages });
}

