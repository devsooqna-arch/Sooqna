-- DropIndex
DROP INDEX "ListingImage_listingId_idx";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "soldAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SavedSearch" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Listing_locationCity_idx" ON "Listing"("locationCity");

-- CreateIndex
CREATE INDEX "Listing_isFeatured_idx" ON "Listing"("isFeatured");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- CreateIndex
CREATE INDEX "Listing_price_idx" ON "Listing"("price");

-- CreateIndex
CREATE INDEX "Listing_expiresAt_idx" ON "Listing"("expiresAt");

-- CreateIndex
CREATE INDEX "Listing_categoryId_status_createdAt_idx" ON "Listing"("categoryId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_locationCity_status_createdAt_idx" ON "Listing"("locationCity", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_isFeatured_status_createdAt_idx" ON "Listing"("isFeatured", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_order_idx" ON "ListingImage"("listingId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

