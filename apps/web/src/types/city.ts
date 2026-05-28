export type City = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  listingCount?: number;
  createdAt: string | null;
  updatedAt: string | null;
};
