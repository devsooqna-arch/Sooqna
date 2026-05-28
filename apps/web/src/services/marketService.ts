import { apiFetch } from "@/services/apiClient";
import type { MarketInsights } from "@/types/market";

export async function getMarketInsights(): Promise<MarketInsights> {
  const response = await apiFetch<{ success: true; data: MarketInsights }>("/market/insights");
  return response.data;
}
