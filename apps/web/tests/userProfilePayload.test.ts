import assert from "node:assert/strict";
import { buildUserProfilePayload } from "../src/services/userProfilePayload";

assert.deepEqual(
  buildUserProfilePayload({ fullName: "Codex Test", photoURL: "" }),
  { fullName: "Codex Test" },
  "blank photoURL should be omitted so backend validation accepts signup profiles"
);

assert.deepEqual(
  buildUserProfilePayload({ fullName: "Codex Test", photoURL: "https://example.com/a.png" }),
  { fullName: "Codex Test", photoURL: "https://example.com/a.png" },
  "valid photoURL should be included"
);
