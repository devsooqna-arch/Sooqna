import assert from "node:assert/strict";
import {
  getEmailActionSettingsForOrigin,
  sendPasswordResetWithLogging,
  sendVerificationEmailWithLogging,
} from "../src/services/authEmailSenders";

async function main() {
  const actionSettings = getEmailActionSettingsForOrigin("https://example.com", "/login");
  assert.deepEqual(
    actionSettings,
    { url: "https://example.com/login", handleCodeInApp: false },
    "Firebase auth emails should carry an action URL on the current authorized origin"
  );

  let resetEmail = "";
  let resetUrl = "";
  await sendPasswordResetWithLogging(
    " user@example.com ",
    actionSettings,
    async (email, settings) => {
      resetEmail = email;
      resetUrl = settings?.url ?? "";
    },
    { info: () => undefined, warn: () => undefined }
  );
  assert.equal(resetEmail, "user@example.com", "forgot password should trigger the Firebase reset sender");
  assert.equal(resetUrl, "https://example.com/login", "reset email should include the configured action URL");

  let verificationUid = "";
  await sendVerificationEmailWithLogging(
    { uid: "user-1", emailVerified: false },
    actionSettings,
    async (user) => {
      verificationUid = user.uid;
    },
    { info: () => undefined, warn: () => undefined }
  );
  assert.equal(verificationUid, "user-1", "registration/resend should trigger the Firebase verification sender");

  await assert.rejects(
    () =>
      sendVerificationEmailWithLogging(
        { uid: "user-1", emailVerified: false },
        actionSettings,
        async () => {
          const error = new Error("limited") as Error & { code: string };
          error.code = "auth/too-many-requests";
          throw error;
        },
        { info: () => undefined, warn: () => undefined }
      ),
    /limited/,
    "Firebase send failures should surface to the UI instead of being counted as successful"
  );
}

void main();
