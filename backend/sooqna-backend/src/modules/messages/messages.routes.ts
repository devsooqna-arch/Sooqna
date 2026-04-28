import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { validateRequest } from "../../middleware/validateRequest";
import {
  conversationIdParamsSchema,
  createConversationBodySchema,
  createMessageBodySchema,
} from "../../shared/validation/schemas";
import {
  createConversation,
  createMessage,
  getConversation,
  getConversationMessages,
  listConversations,
} from "./messages.controller";

export const messagesRouter = Router();

messagesRouter.post(
  "/conversations",
  verifyFirebaseToken,
  requireVerifiedEmail,
  validateRequest({ body: createConversationBodySchema }),
  createConversation
);
messagesRouter.get("/conversations", verifyFirebaseToken, requireVerifiedEmail, listConversations);
messagesRouter.post(
  "/conversations/:conversationId/messages",
  verifyFirebaseToken,
  requireVerifiedEmail,
  validateRequest({
    params: conversationIdParamsSchema,
    body: createMessageBodySchema,
  }),
  createMessage
);
messagesRouter.get(
  "/conversations/:conversationId",
  verifyFirebaseToken,
  requireVerifiedEmail,
  validateRequest({ params: conversationIdParamsSchema }),
  getConversation
);
messagesRouter.get(
  "/conversations/:conversationId/messages",
  verifyFirebaseToken,
  requireVerifiedEmail,
  validateRequest({ params: conversationIdParamsSchema }),
  getConversationMessages
);

