import type { FirestoreDate } from "./firestore";

export interface LocalizedName {
  ar: string;
  en: string;
}

/**
 * `categories/{categoryId}`
 */
export interface Category {
  slug: string;
  name: LocalizedName;
  icon: string;
  imageURL: string;
  parentId: string | null;
  level: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}
