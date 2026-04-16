import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";

export const authRouter = Router();

authRouter.get("/session", verifyFirebaseToken, (req, res) => {
  res.json({
    success: true,
    user: {
      uid: req.authUser?.uid ?? null,
      email: req.authUser?.email ?? null,
    },
  });
});

