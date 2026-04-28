import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { requireAdminScope } from "../../middleware/requireAdminScope";
import { validateRequest } from "../../middleware/validateRequest";
import { createReportBodySchema, idParamsSchema, updateReportStatusBodySchema } from "../../shared/validation/schemas";
import { listModerationQueue, submitReport, updateModerationReport } from "./reports.controller";

export const reportsRouter = Router();

reportsRouter.post("/", verifyFirebaseToken, requireVerifiedEmail, validateRequest({ body: createReportBodySchema }), submitReport);
reportsRouter.get("/queue", verifyFirebaseToken, requireAdminScope, listModerationQueue);
reportsRouter.patch(
  "/:id",
  verifyFirebaseToken,
  requireAdminScope,
  validateRequest({ params: idParamsSchema, body: updateReportStatusBodySchema }),
  updateModerationReport
);
