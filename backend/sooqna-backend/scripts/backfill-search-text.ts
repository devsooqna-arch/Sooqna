import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { buildListingSearchText } from "../src/shared/utils/arabic";

dotenv.config();

/**
 * One-time (idempotent) backfill of Listing.searchText for rows created before
 * the Arabic-aware search column existed. Safe to run repeatedly: it recomputes
 * the normalized value from the current title/description and only writes when
 * it actually differs. Wired into deploy as a best-effort step.
 */
async function main(): Promise<void> {
  const prisma = new PrismaClient();
  let scanned = 0;
  let updated = 0;
  try {
    const listings = await prisma.listing.findMany({
      select: { id: true, title: true, description: true, searchText: true },
    });
    for (const listing of listings) {
      scanned += 1;
      const next = buildListingSearchText(listing.title, listing.description);
      if (next !== listing.searchText) {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { searchText: next },
        });
        updated += 1;
      }
    }
    console.log(`searchText backfill complete: scanned ${scanned}, updated ${updated}.`);
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

void main().catch((error) => {
  console.error("searchText backfill failed:", error);
  process.exit(1);
});
