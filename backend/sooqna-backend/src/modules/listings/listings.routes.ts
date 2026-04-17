import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
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
  patchListing,
} from "./listings.controller";

export const listingsRouter = Router();

listingsRouter.get("/", listListings);
listingsRouter.get("/:id", validateRequest({ params: idParamsSchema }), getListingById);

listingsRouter.post(
  "/",
  verifyFirebaseToken,
  validateRequest({ body: createListingBodySchema }),
  createListing
);
listingsRouter.patch(
  "/:id",
  verifyFirebaseToken,
  validateRequest({ params: idParamsSchema, body: patchListingBodySchema }),
  patchListing
);
listingsRouter.delete(
  "/:id",
  verifyFirebaseToken,
  validateRequest({ params: idParamsSchema }),
  deleteListing
);
listingsRouter.post(
  "/:id/images",
  verifyFirebaseToken,
  validateRequest({ params: idParamsSchema, body: attachListingImageBodySchema }),
  attachListingImage
);

