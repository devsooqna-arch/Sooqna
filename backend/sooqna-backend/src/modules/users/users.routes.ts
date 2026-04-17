import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { validateRequest } from "../../middleware/validateRequest";
import { userProfileBodySchema } from "../../shared/validation/schemas";
import { getMe, upsertProfile } from "./users.controller";

export const usersRouter = Router();

usersRouter.post(
  "/profile",
  verifyFirebaseToken,
  validateRequest({ body: userProfileBodySchema }),
  upsertProfile
);
usersRouter.get("/me", verifyFirebaseToken, getMe);

