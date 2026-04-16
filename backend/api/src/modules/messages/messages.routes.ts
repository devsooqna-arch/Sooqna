import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import {
  createConversation,
  createMessage,
  getConversation,
  getConversationMessages,
} from "./messages.controller";

export const messagesRouter = Router();

messagesRouter.post("/conversations", verifyFirebaseToken, createConversation);
messagesRouter.post(
  "/conversations/:conversationId/messages",
  verifyFirebaseToken,
  createMessage
);
messagesRouter.get("/conversations/:conversationId", getConversation);
messagesRouter.get("/conversations/:conversationId/messages", getConversationMessages);

