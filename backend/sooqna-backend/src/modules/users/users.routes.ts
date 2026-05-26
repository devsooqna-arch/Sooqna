import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { validateRequest } from "../../middleware/validateRequest";
import { userProfileBodySchema, userProfilePatchBodySchema } from "../../shared/validation/schemas";
import { getMe, patchProfile, upsertProfile } from "./users.controller";

export const usersRouter = Router();

usersRouter.post(
  "/profile",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  validateRequest({ body: userProfileBodySchema }),
  upsertProfile
);
usersRouter.put(
  "/profile",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  validateRequest({ body: userProfileBodySchema }),
  upsertProfile
);
usersRouter.patch(
  "/profile",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  validateRequest({ body: userProfilePatchBodySchema }),
  patchProfile
);
usersRouter.get("/profile", verifyFirebaseToken, requireCurrentUser, getMe);
usersRouter.get("/me", verifyFirebaseToken, requireCurrentUser, getMe);

