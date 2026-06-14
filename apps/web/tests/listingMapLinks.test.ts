import assert from "node:assert/strict";
import { buildGoogleMapsHref } from "../src/lib/listingMapLinks";

assert.equal(
  buildGoogleMapsHref({ city: "", area: "" }),
  null,
  "maps link should be hidden when neither coordinates nor a meaningful address exists"
);

assert.equal(
  buildGoogleMapsHref({ city: "aleppo", area: "" }),
  "https://www.google.com/maps/search/?api=1&query=aleppo",
  "maps link should use a non-empty city as the query"
);

assert.equal(
  buildGoogleMapsHref({ city: "amman", area: "jabal amman", latitude: 31.9516, longitude: 35.9239 }),
  "https://www.google.com/maps/search/?api=1&query=31.9516%2C35.9239",
  "valid coordinates should take precedence over text addresses"
);
