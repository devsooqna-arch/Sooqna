-- Add seller trust fields to User
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "isIdVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "totalReviews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "totalListings" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "totalSold" INTEGER NOT NULL DEFAULT 0;

-- Create Review table
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Indexes for Review
CREATE INDEX "Review_sellerId_createdAt_idx" ON "Review"("sellerId", "createdAt");
CREATE INDEX "Review_listingId_idx" ON "Review"("listingId");
CREATE UNIQUE INDEX "reviews_reviewer_listing_unique" ON "Review"("reviewerId", "listingId");

-- Foreign keys for Review
ALTER TABLE "Review" ADD CONSTRAINT "Review_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE CASCADE;
