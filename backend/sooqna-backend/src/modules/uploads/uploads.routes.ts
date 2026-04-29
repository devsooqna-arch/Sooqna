import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { validateRequest } from "../../middleware/validateRequest";
import { emptyQuerySchema, uploadMultipartFieldsSchema } from "../../shared/validation/schemas";
import { handleUploadError, uploadListingImage, uploadProfileAvatar } from "./uploads.controller";
import { createImageUploader } from "./uploads.config";

const listingUploader = createImageUploader("listings");
const profileUploader = createImageUploader("profiles");

export const uploadRouter = Router();

uploadRouter.post(
  "/listing-image",
  verifyFirebaseToken,
  validateRequest({ query: emptyQuerySchema }),
  listingUploader.single("image"),
  handleUploadError,
  validateRequest({ body: uploadMultipartFieldsSchema }),
  uploadListingImage
);

uploadRouter.post(
  "/profile-avatar",
  verifyFirebaseToken,
  validateRequest({ query: emptyQuerySchema }),
  profileUploader.single("image"),
  handleUploadError,
  validateRequest({ body: uploadMultipartFieldsSchema }),
  uploadProfileAvatar
);

