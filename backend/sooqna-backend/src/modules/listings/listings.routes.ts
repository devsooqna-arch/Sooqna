import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { validateRequest } from "../../middleware/validateRequest";
import {
  attachListingImageBodySchema,
  createListingBodySchema,
  idParamsSchema,
  patchListingBodySchema,
} from "../../shared/validation/schemas";
import {
  attachListingImage,
  createListing,
  deleteListing,
  getListingById,
  listListings,
  listMyListings,
  patchListing,
} from "./listings.controller";

export const listingsRouter = Router();

listingsRouter.get("/", listListings);
listingsRouter.get("/mine", verifyFirebaseToken, listMyListings);
listingsRouter.get("/:id", validateRequest({ params: idParamsSchema }), getListingById);

listingsRouter.post(
  "/",
  verifyFirebaseToken,
  requireVerifiedEmail,
  validateRequest({ body: createListingBodySchema }),
  createListing
);
listingsRouter.patch(
  "/:id",
  verifyFirebaseToken,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema, body: patchListingBodySchema }),
  patchListing
);
listingsRouter.delete(
  "/:id",
  verifyFirebaseToken,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema }),
  deleteListing
);
listingsRouter.post(
  "/:id/images",
  verifyFirebaseToken,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema, body: attachListingImageBodySchema }),
  attachListingImage
);

