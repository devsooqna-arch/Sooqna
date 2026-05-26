import assert from "node:assert/strict";
import { buildCreateListingPayload } from "../src/services/listingCreatePayload";

const request = buildCreateListingPayload(
  {
    title: "Camera",
    price: 125,
    currency: "USD",
    categoryId: "electronics",
    description: "Clean camera",
    location: { country: "Syria", city: "aleppo", area: "aleppo" },
  },
  "submit-123"
);

assert.equal(
  request.clientRequestId,
  "submit-123",
  "create listing API payload should include a stable clientRequestId for idempotency"
);
