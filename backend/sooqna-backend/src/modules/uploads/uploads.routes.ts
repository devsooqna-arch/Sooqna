import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { requireActiveUser, requireCurrentUser } from "../../middleware/authContext";
import { requireVerifiedEmail } from "../../middleware/requireVerifiedEmail";
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
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ query: emptyQuerySchema }),
  listingUploader.single("image"),
  handleUploadError,
  validateRequest({ body: uploadMultipartFieldsSchema }),
  uploadListingImage
);

uploadRouter.post(
  "/profile-avatar",
  verifyFirebaseToken,
  requireCurrentUser,
  requireActiveUser,
  requireVerifiedEmail,
  validateRequest({ query: emptyQuerySchema }),
  profileUploader.single("image"),
  handleUploadError,
  validateRequest({ body: uploadMultipartFieldsSchema }),
  uploadProfileAvatar
);

