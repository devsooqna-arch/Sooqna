/**
 * Seeds top-level categories into Firestore using the Admin SDK.
 *
 * Prerequisites (local):
 * - Application Default Credentials, e.g. set `GOOGLE_APPLICATION_CREDENTIALS`
 *   to a service account JSON with Firestore access, **or** use
 *   `gcloud auth application-default login`.
 * - Or run against the Firestore emulator with `FIRESTORE_EMULATOR_HOST` set.
 *
 * Usage (from `backend/functions`):
 *   npm run seed:categories
 */
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { ensureAdminApp } from "../src/config/admin";

ensureAdminApp();

const db = getFirestore();

const categories = [
  {
    slug: "cars",
    name: { ar: "سيارات", en: "Cars" },
    icon: "car",
    imageURL: "",
    parentId: null,
    level: 1,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: "real-estate",
    name: { ar: "عقارات", en: "Real estate" },
    icon: "home",
    imageURL: "",
    parentId: null,
    level: 1,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: "electronics",
    name: { ar: "إلكترونيات", en: "Electronics" },
    icon: "devices",
    imageURL: "",
    parentId: null,
    level: 1,
    isActive: true,
    sortOrder: 3,
  },
];

async function main(): Promise<void> {
  const batch = db.batch();
  const col = db.collection("categories");

  for (const cat of categories) {
    const ref = col.doc(cat.slug);
    batch.set(
      ref,
      {
        ...cat,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
  console.info("Seeded categories:", categories.map((c) => c.slug).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
