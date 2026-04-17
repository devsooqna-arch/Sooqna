import { apiFetch } from "@/services/apiClient";
import type { Category } from "@/types/category";

function mapCategory(data: Omit<Category, "id"> | Record<string, unknown>): Category {
  return {
    id: String((data as Category).id ?? ""),
    name: {
      ar: String((data as Category).name?.ar ?? ""),
      en: String((data as Category).name?.en ?? ""),
    },
    slug: String((data as Category).slug ?? (data as Category).id ?? ""),
    isActive: Boolean((data as Category).isActive),
    sortOrder: Number((data as Category).sortOrder ?? 0),
    createdAt: (data as Category).createdAt ?? null,
  };
}

/**
 * Fetch active categories ordered by `sortOrder`.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiFetch<{ success: true; data: Array<Omit<Category, "id">> }>(
    "/categories?activeOnly=true"
  );
  return response.data.map(mapCategory);
}

/**
 * Fetch one category by document id.
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.id === id) ?? null;
}
