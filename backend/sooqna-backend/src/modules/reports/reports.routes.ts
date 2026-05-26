import { Router } from "express";
import { Role } from "@prisma/client";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { checkRole } from "../../middleware/checkRole";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createReportBodySchema,
  idParamsSchema,
  moderationQueueQuerySchema,
  updateReportStatusBodySchema,
} from "../../shared/validation/schemas";
import { listModerationQueue, submitReport, updateModerationReport } from "./reports.controller";

export const reportsRouter = Router();

reportsRouter.post("/", verifyFirebaseToken, requireCurrentUser, requireActiveUser, requireVerifiedEmail, validateRequest({ body: createReportBodySchema }), submitReport);
reportsRouter.get(
  "/queue",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  checkRole([Role.ADMIN]),
  validateRequest({ query: moderationQueueQuerySchema }),
  listModerationQueue
);
reportsRouter.patch(
  "/:id",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  checkRole([Role.ADMIN]),
  validateRequest({ params: idParamsSchema, body: updateReportStatusBodySchema }),
  updateModerationReport
);
