import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireAdminScope } from "../../middleware/requireAdminScope";
import { getRecentAuditLogs } from "./audit.service";

export const auditRouter = Router();

auditRouter.get("/logs", verifyFirebaseToken, requireAdminScope, async (req, res) => {
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 100, 500));
  const logs = await getRecentAuditLogs(limit);
  res.json({ success: true, logs });
});
