import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { getMe, upsertProfile } from "./users.controller";

export const usersRouter = Router();

usersRouter.post("/profile", verifyFirebaseToken, upsertProfile);
usersRouter.get("/me", verifyFirebaseToken, getMe);

