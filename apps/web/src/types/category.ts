export interface Category {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: any;
}
