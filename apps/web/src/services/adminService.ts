import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";

export type ReseedCategoriesResult = {
  ok: boolean;
  count: number;
  categoryIds: string[];
};

/**
 * Calls admin-only callable function to reseed categories.
 */
export async function reseedCategoriesFromUi(): Promise<ReseedCategoriesResult> {
  const functions = getFunctions(app);
  const callable = httpsCallable<void, ReseedCategoriesResult>(
    functions,
    "reseedCategories"
  );
  const response = await callable();
  return response.data;
}

