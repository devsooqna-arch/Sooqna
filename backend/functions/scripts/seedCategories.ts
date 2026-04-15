/**
 * Seeds categories into Firestore using Firebase Admin SDK.
 *
 * Usage (from backend/functions):
 *   npm run seed:categories
 */
import { ensureAdminApp } from "../src/config/admin";
import { seedCategories } from "../src/modules/categories/seedCategoriesData";

ensureAdminApp();

async function main(): Promise<void> {
  const result = await seedCategories();
  console.info("Seeded categories:", result.categoryIds.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
