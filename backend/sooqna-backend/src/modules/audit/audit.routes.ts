import { Router } from "express";
import { Role } from "@prisma/client";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { checkRole } from "../../middleware/checkRole";
import { validateRequest } from "../../middleware/validateRequest";
import { auditLogsQuerySchema } from "../../shared/validation/schemas";
import { getRecentAuditLogs } from "./audit.service";

export const auditRouter = Router();

auditRouter.get("/logs", verifyFirebaseToken, checkRole([Role.ADMIN]), validateRequest({ query: auditLogsQuerySchema }), async (req, res) => {
  const limit = Number(req.query.limit ?? 100);
  const logs = await getRecentAuditLogs(limit);
  res.json({ success: true, logs });
});
