import assert from "node:assert/strict";
import { wpExactRedirects } from "../wp-redirects.mjs";

function destinationFor(source) {
  return wpExactRedirects.find((rule) => rule.source === source)?.destination;
}

assert.equal(destinationFor("/privacy-policy/"), "/privacy", "legacy privacy URL should redirect to the Next privacy page");
assert.equal(destinationFor("/pricing/"), "/packages", "legacy pricing URL should redirect to the Next packages page");
assert.equal(destinationFor("/apps/"), "/packages", "legacy apps URL should redirect to the Next packages page");
assert.equal(destinationFor("/advertise/"), "/contact", "legacy advertise URL should redirect to the contact page");
