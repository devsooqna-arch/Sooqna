import { auth } from "@/lib/firebase";

const DEFAULT_API_BASE = "http://localhost:5000/api";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? DEFAULT_API_BASE;
}

export type UploadListingImageResult = {
  success: true;
  url: string;
  path: string;
  filename: string;
  size: number;
};

export type UploadProfileAvatarResult = {
  success: true;
  avatarUrl: string;
  avatarPath: string;
  filename: string;
  size: number;
};

export async function uploadBackendListingImage(
  file: File
): Promise<UploadListingImageResult> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated.");
  }
  const token = await user.getIdToken();

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${apiBase()}/uploads/listing-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Upload failed with ${response.status}`);
  }
  return (await response.json()) as UploadListingImageResult;
}

export async function uploadBackendProfileAvatar(
  file: File
): Promise<UploadProfileAvatarResult> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated.");
  }
  const token = await user.getIdToken();

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${apiBase()}/uploads/profile-avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Upload failed with ${response.status}`);
  }
  return (await response.json()) as UploadProfileAvatarResult;
}

export { uploadBackendListingImage as uploadImage };

