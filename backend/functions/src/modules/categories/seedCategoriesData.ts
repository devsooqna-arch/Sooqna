import { FieldValue, getFirestore } from "firebase-admin/firestore";

const categories = [
  {
    id: "cars",
    name: { ar: "سيارات", en: "Cars" },
    slug: "cars",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "real-estate",
    name: { ar: "عقارات", en: "Real Estate" },
    slug: "real-estate",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "electronics",
    name: { ar: "إلكترونيات", en: "Electronics" },
    slug: "electronics",
    isActive: true,
    sortOrder: 3,
  },
] as const;

/**
 * Shared seeding routine used by script and callable function.
 */
export async function seedCategories(): Promise<{
  count: number;
  categoryIds: string[];
}> {
  const db = getFirestore();
  const col = db.collection("categories");

  for (const category of categories) {
    await col.doc(category.id).set(
      {
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  return {
    count: categories.length,
    categoryIds: categories.map((c) => c.id),
  };
}

