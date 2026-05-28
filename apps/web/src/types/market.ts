export type MarketInsights = {
  topCities: Array<{ city: string; listingCount: number }>;
  topCategories: Array<{ categoryId: string; listingCount: number }>;
  averagePricesByCategory: Array<{ categoryId: string; averagePrice: number }>;
  newListings7d: number;
};
