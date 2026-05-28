-- CreateTable
CREATE TABLE "City" (
  "id" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3),
  CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");
CREATE INDEX "City_isActive_sortOrder_idx" ON "City"("isActive", "sortOrder");
CREATE INDEX "City_slug_idx" ON "City"("slug");

-- Seed existing city options used by the web app.
INSERT INTO "City" ("id", "nameAr", "nameEn", "slug", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('damascus', 'دمشق', 'Damascus', 'damascus', true, 1, NOW(), NOW()),
  ('rifdimashq', 'ريف دمشق', 'Rif Dimashq', 'rifdimashq', true, 2, NOW(), NOW()),
  ('aleppo', 'حلب', 'Aleppo', 'aleppo', true, 3, NOW(), NOW()),
  ('homs', 'حمص', 'Homs', 'homs', true, 4, NOW(), NOW()),
  ('hama', 'حماة', 'Hama', 'hama', true, 5, NOW(), NOW()),
  ('latakia', 'اللاذقية', 'Latakia', 'latakia', true, 6, NOW(), NOW()),
  ('tartus', 'طرطوس', 'Tartus', 'tartus', true, 7, NOW(), NOW()),
  ('idlib', 'إدلب', 'Idlib', 'idlib', true, 8, NOW(), NOW()),
  ('daraa', 'درعا', 'Daraa', 'daraa', true, 9, NOW(), NOW()),
  ('sweida', 'السويداء', 'As-Suwayda', 'sweida', true, 10, NOW(), NOW()),
  ('quneitra', 'القنيطرة', 'Quneitra', 'quneitra', true, 11, NOW(), NOW()),
  ('deirezzor', 'دير الزور', 'Deir ez-Zor', 'deirezzor', true, 12, NOW(), NOW()),
  ('raqqa', 'الرقة', 'Raqqa', 'raqqa', true, 13, NOW(), NOW()),
  ('alhasakah', 'الحسكة', 'Al-Hasakah', 'alhasakah', true, 14, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
