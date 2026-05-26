import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { contentFilter } from "../../middleware/contentFilter";
import { validateRequest } from "../../middleware/validateRequest";
import {
  attachListingImageBodySchema,
  batchListingIdsBodySchema,
  createListingBodySchema,
  idParamsSchema,
  listingsQuerySchema,
  patchListingBodySchema,
  renewListingBodySchema,
} from "../../shared/validation/schemas";
import {
  archiveListing,
  attachListingImage,
  createListing,
  deleteListing,
  expireListing,
  featureListing,
  getListingById,
  getListingsByIds,
  listListings,
  listMyListings,
  markListingSold,
  patchListing,
  publishListing,
  renewListing,
  unfeatureListing,
  unpublishListing,
} from "./listings.controller";

export const listingsRouter = Router();

listingsRouter.get("/", validateRequest({ query: listingsQuerySchema }), listListings);
listingsRouter.get("/mine", verifyFirebaseToken, requireCurrentUser, requireActiveUser, listMyListings);
listingsRouter.post("/batch", validateRequest({ body: batchListingIdsBodySchema }), getListingsByIds);
listingsRouter.get("/:id", validateRequest({ params: idParamsSchema }), getListingById);

listingsRouter.post(
  "/",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  contentFilter,
  validateRequest({ body: createListingBodySchema }),
  createListing
);
listingsRouter.patch(
  "/:id",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  contentFilter,
  validateRequest({ params: idParamsSchema, body: patchListingBodySchema }),
  patchListing
);
listingsRouter.post(
  "/:id/publish",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema }),
  publishListing
);
listingsRouter.post(
  "/:id/unpublish",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema }),
  unpublishListing
);
listingsRouter.post(
  "/:id/archive",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema }),
  archiveListing
);
listingsRouter.post(
  "/:id/sold",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema }),
  markListingSold
);
listingsRouter.post(
  "/:id/renew",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema, body: renewListingBodySchema }),
  renewListing
);
listingsRouter.post(
  "/:id/expire",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema }),
  expireListing
);
listingsRouter.delete(
  "/:id",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema }),
  deleteListing
);
listingsRouter.post(
  "/:id/feature",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  validateRequest({ params: idParamsSchema }),
  featureListing
);
listingsRouter.post(
  "/:id/unfeature",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  validateRequest({ params: idParamsSchema }),
  unfeatureListing
);
listingsRouter.post(
  "/:id/images",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ params: idParamsSchema, body: attachListingImageBodySchema }),
  attachListingImage
);
