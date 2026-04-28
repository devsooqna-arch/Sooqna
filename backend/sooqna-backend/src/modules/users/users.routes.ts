import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { validateRequest } from "../../middleware/validateRequest";
import { userProfileBodySchema, userProfilePatchBodySchema } from "../../shared/validation/schemas";
import { getMe, patchProfile, upsertProfile } from "./users.controller";

export const usersRouter = Router();

usersRouter.post(
  "/profile",
  verifyFirebaseToken,
  validateRequest({ body: userProfileBodySchema }),
  upsertProfile
);
usersRouter.put(
  "/profile",
  verifyFirebaseToken,
  validateRequest({ body: userProfileBodySchema }),
  upsertProfile
);
usersRouter.patch(
  "/profile",
  verifyFirebaseToken,
  validateRequest({ body: userProfilePatchBodySchema }),
  patchProfile
);
usersRouter.get("/profile", verifyFirebaseToken, getMe);
usersRouter.get("/me", verifyFirebaseToken, getMe);

