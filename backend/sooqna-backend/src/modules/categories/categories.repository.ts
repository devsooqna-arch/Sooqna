import { prisma } from "../../config/prisma";

export type CategoryRecord = {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt?: string | null;
};

export interface CategoriesRepository {
  list(activeOnly: boolean): Promise<CategoryRecord[]>;
}

export class PrismaCategoriesRepository implements CategoriesRepository {
  async list(activeOnly: boolean): Promise<CategoryRecord[]> {
    try {
      const categories = await prisma.category.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      });

      return categories.map((category) => ({
        id: category.id,
        name: {
          ar: category.nameAr,
          en: category.nameEn,
        },
        slug: category.slug,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt ? category.createdAt.toISOString() : null,
        updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
      }));
    } catch {
      throw new Error("Failed to list categories.");
    }
  }

  async upsertMany(records: CategoryRecord[]): Promise<void> {
    try {
      for (const record of records) {
        await prisma.category.upsert({
          where: { id: record.id },
          update: {
            nameAr: record.name.ar,
            nameEn: record.name.en,
            slug: record.slug,
            isActive: record.isActive,
            sortOrder: record.sortOrder,
            createdAt: record.createdAt ? new Date(record.createdAt) : null,
            updatedAt: record.updatedAt ? new Date(record.updatedAt) : null,
          },
          create: {
            id: record.id,
            nameAr: record.name.ar,
            nameEn: record.name.en,
            slug: record.slug,
            isActive: record.isActive,
            sortOrder: record.sortOrder,
            createdAt: record.createdAt ? new Date(record.createdAt) : null,
            updatedAt: record.updatedAt ? new Date(record.updatedAt) : null,
          },
        });
      }
    } catch {
      throw new Error("Failed to seed categories.");
    }
  }
}

