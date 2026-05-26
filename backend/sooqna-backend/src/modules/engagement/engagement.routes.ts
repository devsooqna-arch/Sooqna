import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { validateRequest } from "../../middleware/validateRequest";
import { engagementEventBodySchema, engagementRecentQuerySchema } from "../../shared/validation/schemas";
import { trackEngagementEvent, listRecentEngagementEvents } from "./engagement.service";

export const engagementRouter = Router();

engagementRouter.post("/events", verifyFirebaseToken, requireCurrentUser, requireActiveUser, validateRequest({ body: engagementEventBodySchema }), async (req, res) => {
  await trackEngagementEvent({
    eventType: req.body.eventType,
    listingId: req.body.listingId,
    conversationId: req.body.conversationId,
    actorId: req.currentUser?.firebaseUid,
    metadata: req.body.metadata,
  });
  res.json({ success: true });
});

engagementRouter.get("/events/recent", verifyFirebaseToken, requireCurrentUser, requireActiveUser, validateRequest({ query: engagementRecentQuerySchema }), async (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  res.json({ success: true, events: await listRecentEngagementEvents(limit) });
});
