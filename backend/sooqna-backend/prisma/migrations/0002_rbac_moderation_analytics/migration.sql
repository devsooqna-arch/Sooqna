-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BUYER', 'SELLER');

-- Backfill + convert existing User.role values
UPDATE "User"
SET "role" = CASE
  WHEN UPPER("role") IN ('ADMIN', 'BUYER', 'SELLER') THEN UPPER("role")
  WHEN LOWER("role") = 'user' THEN 'BUYER'
  ELSE 'BUYER'
END;

-- AlterTable
ALTER TABLE "User"
ALTER COLUMN "role" TYPE "Role" USING ("role"::"Role"),
ALTER COLUMN "role" SET DEFAULT 'BUYER';

-- CreateTable
CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "reasonCode" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "moderatorId" TEXT,
  "moderatorNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementEvent" (
  "id" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "listingId" TEXT,
  "conversationId" TEXT,
  "actorId" TEXT,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EngagementEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");
CREATE INDEX "Report_reporterId_createdAt_idx" ON "Report"("reporterId", "createdAt");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
CREATE INDEX "EngagementEvent_createdAt_idx" ON "EngagementEvent"("createdAt");
CREATE INDEX "EngagementEvent_eventType_createdAt_idx" ON "EngagementEvent"("eventType", "createdAt");
CREATE INDEX "EngagementEvent_listingId_createdAt_idx" ON "EngagementEvent"("listingId", "createdAt");
