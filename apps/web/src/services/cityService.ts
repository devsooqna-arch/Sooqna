import { apiFetch } from "@/services/apiClient";
import { SYRIAN_GOVERNORATES } from "@/lib/locations";
import type { City } from "@/types/city";

function mapCity(data: Partial<City> | Record<string, unknown>): City {
  const id = String((data as City).id ?? (data as City).slug ?? "");
  return {
    id,
    nameAr: String((data as City).nameAr ?? id),
    nameEn: String((data as City).nameEn ?? id),
    slug: String((data as City).slug ?? id),
    isActive: Boolean((data as City).isActive ?? true),
    sortOrder: Number((data as City).sortOrder ?? 0),
    listingCount: typeof (data as City).listingCount === "number" ? (data as City).listingCount : undefined,
    createdAt: (data as City).createdAt ?? null,
    updatedAt: (data as City).updatedAt ?? null,
  };
}

function fallbackCities(): City[] {
  return SYRIAN_GOVERNORATES.map((city, index) => ({
    id: city.value,
    slug: city.value,
    nameAr: city.labelAr,
    nameEn: city.labelEn,
    isActive: true,
    sortOrder: index + 1,
    createdAt: null,
    updatedAt: null,
  }));
}

export async function getCities(): Promise<City[]> {
  try {
    const response = await apiFetch<{ success: true; data: City[] }>("/cities?activeOnly=true");
    return response.data.map(mapCity);
  } catch {
    return fallbackCities();
  }
}
