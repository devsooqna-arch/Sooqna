import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import {
  attachListingImage,
  createListing,
  deleteListing,
  getListingById,
  listListings,
  patchListing,
} from "./listings.controller";

export const listingsRouter = Router();

listingsRouter.get("/", listListings);
listingsRouter.get("/:id", getListingById);

listingsRouter.post("/", verifyFirebaseToken, createListing);
listingsRouter.patch("/:id", verifyFirebaseToken, patchListing);
listingsRouter.delete("/:id", verifyFirebaseToken, deleteListing);
listingsRouter.post("/:id/images", verifyFirebaseToken, attachListingImage);

