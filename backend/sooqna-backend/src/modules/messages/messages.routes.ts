import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
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
} from "./messages.controller";

export const messagesRouter = Router();

messagesRouter.post(
  "/conversations",
  verifyFirebaseToken,
  validateRequest({ body: createConversationBodySchema }),
  createConversation
);
messagesRouter.post(
  "/conversations/:conversationId/messages",
  verifyFirebaseToken,
  validateRequest({
    params: conversationIdParamsSchema,
    body: createMessageBodySchema,
  }),
  createMessage
);
messagesRouter.get(
  "/conversations/:conversationId",
  verifyFirebaseToken,
  validateRequest({ params: conversationIdParamsSchema }),
  getConversation
);
messagesRouter.get(
  "/conversations/:conversationId/messages",
  verifyFirebaseToken,
  validateRequest({ params: conversationIdParamsSchema }),
  getConversationMessages
);

