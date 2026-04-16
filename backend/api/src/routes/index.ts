import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { uploadRouter } from "../modules/uploads/uploads.routes";
import { usersRouter } from "../modules/users/users.routes";
import { listingsRouter } from "../modules/listings/listings.routes";
import { favoritesRouter } from "../modules/favorites/favorites.routes";
import { messagesRouter } from "../modules/messages/messages.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/listings", listingsRouter);
apiRouter.use("/favorites", favoritesRouter);
apiRouter.use("/messages", messagesRouter);

