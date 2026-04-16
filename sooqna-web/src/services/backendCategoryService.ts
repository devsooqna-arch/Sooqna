import { apiClient } from "./apiClient";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient<{ success: true; listings?: never; categories?: Category[] }>(
    "/categories",
    {
      method: "GET",
    }
  ).catch(() => ({ success: true, categories: [] as Category[] }));
  return response.categories ?? [];
}

