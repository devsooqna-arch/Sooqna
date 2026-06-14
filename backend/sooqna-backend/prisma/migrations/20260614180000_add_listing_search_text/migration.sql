-- AlterTable: add normalized searchable text for Arabic-aware listing search.
-- Existing rows default to '' and are populated by scripts/backfill-search-text.ts
-- (run on deploy). New/updated rows are populated by the application layer.
ALTER TABLE "Listing" ADD COLUMN "searchText" TEXT NOT NULL DEFAULT '';
