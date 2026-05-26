ALTER TABLE "Listing" ADD COLUMN "clientRequestId" TEXT;

CREATE UNIQUE INDEX "listings_owner_client_request_unique"
  ON "Listing"("ownerId", "clientRequestId");
