import { auth } from "@/lib/firebase";
import { API_BASE_URL } from "@/lib/api";

export async function uploadListingImage(file: File): Promise<{
  success: true;
  url: string;
  path: string;
  filename: string;
  size: number;
}> {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  const token = await user.getIdToken();

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/uploads/listing-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return (await response.json()) as {
    success: true;
    url: string;
    path: string;
    filename: string;
    size: number;
  };
}

