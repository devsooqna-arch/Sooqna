import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { trackEngagementEvent, listRecentEngagementEvents } from "./engagement.service";

export const engagementRouter = Router();

engagementRouter.post("/events", verifyFirebaseToken, async (req, res) => {
  const eventType = String(req.body?.eventType ?? "");
  if (!["favorite", "view", "contact_intent"].includes(eventType)) {
    res.status(400).json({ success: false, code: "VALIDATION_ERROR", message: "Invalid eventType." });
    return;
  }
  await trackEngagementEvent({
    eventType: eventType as "favorite" | "view" | "contact_intent",
    listingId: typeof req.body?.listingId === "string" ? req.body.listingId : undefined,
    conversationId: typeof req.body?.conversationId === "string" ? req.body.conversationId : undefined,
    actorId: req.authUser?.uid,
    metadata: req.body?.metadata && typeof req.body.metadata === "object" ? req.body.metadata : undefined,
  });
  res.json({ success: true });
});

engagementRouter.get("/events/recent", verifyFirebaseToken, (req, res) => {
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 50, 200));
  res.json({ success: true, events: listRecentEngagementEvents(limit) });
});
