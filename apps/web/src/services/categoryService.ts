import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category } from "@/types/category";

const categoriesRef = collection(db, "categories");

function mapCategory(
  id: string,
  data: Omit<Category, "id"> | Record<string, unknown>
): Category {
  return {
    id,
    name: {
      ar: String((data as Category).name?.ar ?? ""),
      en: String((data as Category).name?.en ?? ""),
    },
    slug: String((data as Category).slug ?? id),
    isActive: Boolean((data as Category).isActive),
    sortOrder: Number((data as Category).sortOrder ?? 0),
    createdAt: (data as Category).createdAt ?? null,
  };
}

/**
 * Fetch active categories ordered by `sortOrder`.
 */
export async function getCategories(): Promise<Category[]> {
  const q = query(
    categoriesRef,
    where("isActive", "==", true),
    orderBy("sortOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapCategory(d.id, d.data() as Omit<Category, "id">));
}

/**
 * Fetch one category by document id.
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const ref = doc(db, "categories", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  return mapCategory(snap.id, snap.data() as Omit<Category, "id">);
}
