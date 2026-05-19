import assert from "node:assert/strict";
import { getAccountSettingsActionState } from "../src/components/me/accountSettingsActions";

const googleOnlyState = getAccountSettingsActionState({
  hasEmail: true,
  hasEmailPasswordProvider: false,
  emailVerified: true,
});

assert.equal(
  googleOnlyState.showLogout,
  true,
  "settings page should always expose logout even for Google/external accounts"
);

assert.equal(
  googleOnlyState.canSendPasswordReset,
  true,
  "signed-in users with an email should have a visible password recovery action"
);

const unverifiedState = getAccountSettingsActionState({
  hasEmail: true,
  hasEmailPasswordProvider: true,
  emailVerified: false,
});

assert.equal(
  unverifiedState.canResendVerification,
  true,
  "unverified email/password users should keep the resend verification action"
);
