import assert from "node:assert/strict";
import { completeSignupVerification } from "../src/components/auth/signupVerification";

async function main() {
  let resendCount = 0;

  const sent = await completeSignupVerification({
    emailVerified: false,
    resendEmailVerification: async () => {
      resendCount += 1;
    },
  });

  assert.equal(resendCount, 1, "unverified signup should send a verification email");
  assert.equal(sent.shouldRedirect, false, "unverified signup should stay on the auth page");

  const verified = await completeSignupVerification({
    emailVerified: true,
    resendEmailVerification: async () => {
      throw new Error("should not send");
    },
  });

  assert.equal(verified.shouldRedirect, true, "already verified signup can continue normally");

  await assert.rejects(
    () =>
      completeSignupVerification({
        emailVerified: false,
        resendEmailVerification: async () => {
          throw new Error("send failed");
        },
      }),
    /send failed/,
    "verification send failures must surface to the UI"
  );
}

void main();
