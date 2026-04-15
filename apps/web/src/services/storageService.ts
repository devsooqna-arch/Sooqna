import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

type UploadImageResult = {
  url: string;
  path: string;
};

function sanitizeFileName(name: string): string {
  return name.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
}

/**
 * Uploads a listing image to Firebase Storage and returns its public URL + path.
 */
export async function uploadImage(file: File, userId: string): Promise<UploadImageResult> {
  if (!file) {
    throw new Error("Image file is required.");
  }
  if (!userId.trim()) {
    throw new Error("User id is required.");
  }

  const timestamp = Date.now();
  const safeName = sanitizeFileName(file.name || "image");
  const path = `listings/${userId}/${timestamp}_${safeName}`;
  const imageRef = ref(storage, path);

  try {
    await uploadBytes(imageRef, file, {
      contentType: file.type || "application/octet-stream",
    });
    const url = await getDownloadURL(imageRef);
    return { url, path };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    throw new Error(message);
  }
}

