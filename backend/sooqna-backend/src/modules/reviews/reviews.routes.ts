import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
import { validateRequest } from "../../middleware/validateRequest";
import { contentFilter } from "../../middleware/contentFilter";
import { asyncHandler } from "../../middleware/asyncHandler";
import { createReviewBodySchema, sellerIdParamsSchema, reviewsQuerySchema } from "../../shared/validation/schemas";
import {
  createReview,
  getSellerReviews,
  getSellerProfile,
  getListingReviews,
} from "./reviews.controller";

export const reviewsRouter = Router();

reviewsRouter.post(
  "/",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  contentFilter,
  validateRequest({ body: createReviewBodySchema }),
  asyncHandler(createReview)
);

reviewsRouter.get(
  "/seller/:sellerId",
  validateRequest({ params: sellerIdParamsSchema, query: reviewsQuerySchema }),
  asyncHandler(getSellerReviews)
);

reviewsRouter.get(
  "/seller/:sellerId/profile",
  validateRequest({ params: sellerIdParamsSchema }),
  asyncHandler(getSellerProfile)
);

reviewsRouter.get(
  "/listing/:listingId",
  asyncHandler(getListingReviews)
);
