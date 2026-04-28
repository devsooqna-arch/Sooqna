import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { handleUploadError, uploadListingImage, uploadProfileAvatar } from "./uploads.controller";
import { createImageUploader } from "./uploads.config";

const listingUploader = createImageUploader("listings");
const profileUploader = createImageUploader("profiles");

export const uploadRouter = Router();

uploadRouter.post(
  "/listing-image",
  verifyFirebaseToken,
  listingUploader.single("image"),
  handleUploadError,
  uploadListingImage
);

uploadRouter.post(
  "/profile-avatar",
  verifyFirebaseToken,
  profileUploader.single("image"),
  handleUploadError,
  uploadProfileAvatar
);

