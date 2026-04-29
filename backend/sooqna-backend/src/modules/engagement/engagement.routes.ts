import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { validateRequest } from "../../middleware/validateRequest";
import { engagementEventBodySchema, engagementRecentQuerySchema } from "../../shared/validation/schemas";
import { trackEngagementEvent, listRecentEngagementEvents } from "./engagement.service";

export const engagementRouter = Router();

engagementRouter.post("/events", verifyFirebaseToken, validateRequest({ body: engagementEventBodySchema }), async (req, res) => {
  await trackEngagementEvent({
    eventType: req.body.eventType,
    listingId: req.body.listingId,
    conversationId: req.body.conversationId,
    actorId: req.authUser?.uid,
    metadata: req.body.metadata,
  });
  res.json({ success: true });
});

engagementRouter.get("/events/recent", verifyFirebaseToken, validateRequest({ query: engagementRecentQuerySchema }), async (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  res.json({ success: true, events: await listRecentEngagementEvents(limit) });
});
