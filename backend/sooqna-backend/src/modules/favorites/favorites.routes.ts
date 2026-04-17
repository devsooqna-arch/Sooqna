import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { addFavorite, listFavorites, removeFavorite } from "./favorites.controller";

export const favoritesRouter = Router();

favoritesRouter.use(verifyFirebaseToken);
favoritesRouter.post("/:listingId", addFavorite);
favoritesRouter.delete("/:listingId", removeFavorite);
favoritesRouter.get("/", listFavorites);

