import type { CreateListingInput } from "@/types/listing";

export function buildCreateListingPayload(input: CreateListingInput, clientRequestId: string) {
  const location = {
    country: input.location?.country?.trim() || "Syria",
    city: input.location?.city?.trim() || "",
    area: input.location?.area?.trim() || "Aleppo",
  };

  return {
    title: input.title,
    price: input.price,
    currency: input.currency ?? "SYP",
    categoryId: input.categoryId,
    description: input.description ?? "",
    location,
    clientRequestId,
  };
}
