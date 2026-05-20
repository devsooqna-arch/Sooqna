import assert from "node:assert/strict";
import {
  getDuplicateSignupRecoveryMessage,
  isEmailAlreadyInUseError,
} from "../src/components/auth/signupRecovery";

assert.equal(
  isEmailAlreadyInUseError({ code: "auth/email-already-in-use" }),
  true,
  "Firebase email-already-in-use errors should be recognized"
);

assert.equal(
  isEmailAlreadyInUseError({ code: "auth/invalid-credential" }),
  false,
  "other Firebase auth errors should not be treated as duplicate signup"
);

assert.equal(
  isEmailAlreadyInUseError(new Error("email exists")),
  false,
  "plain errors should not be treated as duplicate signup"
);

assert.match(
  getDuplicateSignupRecoveryMessage(),
  /Google/,
  "duplicate signup recovery should explain that the email may belong to a Google provider account"
);
