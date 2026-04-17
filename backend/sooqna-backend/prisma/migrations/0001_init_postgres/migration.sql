-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "firebaseUid" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "role" TEXT NOT NULL,
  "accountStatus" TEXT NOT NULL,
  "isEmailVerified" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "titleLower" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "priceType" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "ownerId" TEXT,
  "ownerSnapshotName" TEXT NOT NULL,
  "ownerSnapshotPhotoUrl" TEXT NOT NULL,
  "locationCountry" TEXT NOT NULL,
  "locationCity" TEXT NOT NULL,
  "locationArea" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "condition" TEXT NOT NULL,
  "contactPreference" TEXT NOT NULL,
  "viewsCount" INTEGER NOT NULL,
  "favoritesCount" INTEGER NOT NULL,
  "messagesCount" INTEGER NOT NULL,
  "isFeatured" BOOLEAN NOT NULL,
  "isApproved" BOOLEAN NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "listingSnapshotTitle" TEXT NOT NULL,
  "listingSnapshotPrimaryImageURL" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "lastMessageText" TEXT NOT NULL,
  "lastMessageSenderId" TEXT NOT NULL,
  "lastMessageAt" TIMESTAMP(3),
  "lastMessageType" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "photoURL" TEXT NOT NULL,
  CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "attachments" JSONB NOT NULL,
  "isRead" BOOLEAN NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3),
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "listingId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_idx" ON "ListingImage"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_listing_unique" ON "Favorite"("userId", "listingId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- AddForeignKey
ALTER TABLE "Listing"
ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("firebaseUid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage"
ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite"
ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant"
ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message"
ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload"
ADD CONSTRAINT "Upload_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

