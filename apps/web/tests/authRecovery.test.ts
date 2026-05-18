import assert from "node:assert/strict";
import {
  shouldBlockVerifiedAction,
  shouldDisableAuthControls,
  shouldRedirectSignedInFromAuthPage,
} from "../src/components/auth/authRecovery";

assert.equal(
  shouldRedirectSignedInFromAuthPage({
    hasUser: true,
    emailVerified: false,
    authLoading: false,
    authPageMode: "login",
  }),
  true,
  "unverified signed-in users should still leave the login page"
);

assert.equal(
  shouldRedirectSignedInFromAuthPage({
    hasUser: true,
    emailVerified: true,
    authLoading: false,
    authPageMode: "login",
  }),
  true,
  "verified users should continue through the normal redirect"
);

assert.equal(
  shouldRedirectSignedInFromAuthPage({
    hasUser: false,
    emailVerified: false,
    authLoading: false,
    authPageMode: "signup",
  }),
  false,
  "signed-out users should see the normal auth form"
);

assert.equal(
  shouldBlockVerifiedAction({ hasUser: true, emailVerified: false, authLoading: false }),
  true,
  "unverified users should be blocked from verified-only actions like posting ads"
);

assert.equal(
  shouldBlockVerifiedAction({ hasUser: true, emailVerified: true, authLoading: false }),
  false,
  "verified users should access verified-only actions"
);

assert.equal(
  shouldDisableAuthControls({ busy: false, authLoading: true, authInitTimedOut: false }),
  true,
  "controls should stay disabled while the initial auth check is still inside the safety window"
);

assert.equal(
  shouldDisableAuthControls({ busy: false, authLoading: true, authInitTimedOut: true }),
  false,
  "controls should unlock after the auth safety timeout"
);

assert.equal(
  shouldDisableAuthControls({ busy: true, authLoading: false, authInitTimedOut: true }),
  true,
  "controls should stay disabled while submitting"
);
