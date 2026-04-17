import { Router } from "express";
import { verifyFirebaseToken } from "../../middleware/verifyFirebaseToken";
import { handleUploadError, uploadListingImage } from "./uploads.controller";
import { createImageUploader } from "./uploads.config";

const listingUploader = createImageUploader("listings");

export const uploadRouter = Router();

uploadRouter.post(
  "/listing-image",
  verifyFirebaseToken,
  listingUploader.single("image"),
  handleUploadError,
  uploadListingImage
);

