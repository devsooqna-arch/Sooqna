ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "ListingModerationLog" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingModerationLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ListingModerationLog_listingId_createdAt_idx" ON "ListingModerationLog"("listingId", "createdAt");
CREATE INDEX IF NOT EXISTS "ListingModerationLog_adminUserId_createdAt_idx" ON "ListingModerationLog"("adminUserId", "createdAt");
CREATE INDEX IF NOT EXISTS "ListingModerationLog_action_createdAt_idx" ON "ListingModerationLog"("action", "createdAt");
