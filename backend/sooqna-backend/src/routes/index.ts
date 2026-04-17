import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { uploadRouter } from "../modules/uploads/uploads.routes";
import { usersRouter } from "../modules/users/users.routes";
import { listingsRouter } from "../modules/listings/listings.routes";
import { favoritesRouter } from "../modules/favorites/favorites.routes";
import { messagesRouter } from "../modules/messages/messages.routes";
import { categoriesRouter } from "../modules/categories/categories.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/listings", listingsRouter);
apiRouter.use("/favorites", favoritesRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use("/categories", categoriesRouter);

