import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { validateRequest } from "../../middleware/validateRequest";
import { contentFilter } from "../../middleware/contentFilter";
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
  contentFilter,
  validateRequest({ body: createReviewBodySchema }),
  createReview
);

reviewsRouter.get(
  "/seller/:sellerId",
  validateRequest({ params: sellerIdParamsSchema, query: reviewsQuerySchema }),
  getSellerReviews
);

reviewsRouter.get(
  "/seller/:sellerId/profile",
  validateRequest({ params: sellerIdParamsSchema }),
  getSellerProfile
);

reviewsRouter.get(
  "/listing/:listingId",
  getListingReviews
);
