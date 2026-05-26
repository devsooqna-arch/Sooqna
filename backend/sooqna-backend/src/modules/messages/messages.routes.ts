import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { contentFilter } from "../../middleware/contentFilter";
import { validateRequest } from "../../middleware/validateRequest";
import {
  conversationIdParamsSchema,
  conversationUnreadParams,
  createConversationBodySchema,
  createMessageBodySchema,
} from "../../shared/validation/schemas";
import {
  createConversation,
  createMessage,
  getConversation,
  getConversationMessages,
  getUnreadSummary,
  listConversations,
  markConversationRead,
} from "./messages.controller";

export const messagesRouter = Router();

messagesRouter.post(
  "/conversations",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  contentFilter,
  validateRequest({ body: createConversationBodySchema }),
  createConversation
);
messagesRouter.get("/conversations", verifyFirebaseToken, requireCurrentUser, requireActiveUser, requireVerifiedEmail, listConversations);
messagesRouter.get("/conversations/unread-summary", verifyFirebaseToken, requireCurrentUser, requireActiveUser, requireVerifiedEmail, getUnreadSummary);
messagesRouter.post(
  "/conversations/:conversationId/messages",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  contentFilter,
  validateRequest({
    params: conversationIdParamsSchema,
    body: createMessageBodySchema,
  }),
  createMessage
);
messagesRouter.get(
  "/conversations/:conversationId",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: conversationIdParamsSchema }),
  getConversation
);
messagesRouter.get(
  "/conversations/:conversationId/messages",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: conversationIdParamsSchema }),
  getConversationMessages
);
messagesRouter.post(
  "/conversations/:conversationId/read",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: conversationUnreadParams }),
  markConversationRead
);
