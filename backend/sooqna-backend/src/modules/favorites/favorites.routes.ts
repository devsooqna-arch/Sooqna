import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { validateRequest } from "../../middleware/validateRequest";
import { listingIdParamsSchema } from "../../shared/validation/schemas";
import { addFavorite, listFavorites, removeFavorite } from "./favorites.controller";

export const favoritesRouter = Router();

favoritesRouter.use(verifyFirebaseToken);
favoritesRouter.use(requireVerifiedEmail);
favoritesRouter.post("/:listingId", validateRequest({ params: listingIdParamsSchema }), addFavorite);
favoritesRouter.delete(
  "/:listingId",
  validateRequest({ params: listingIdParamsSchema }),
  removeFavorite
);
favoritesRouter.get("/", listFavorites);

