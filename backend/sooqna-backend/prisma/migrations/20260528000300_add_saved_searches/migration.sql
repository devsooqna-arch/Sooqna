CREATE TABLE IF NOT EXISTS "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SavedSearch_userId_createdAt_idx" ON "SavedSearch"("userId", "createdAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'SavedSearch_userId_fkey'
    ) THEN
        ALTER TABLE "SavedSearch"
        ADD CONSTRAINT "SavedSearch_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("firebaseUid")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
