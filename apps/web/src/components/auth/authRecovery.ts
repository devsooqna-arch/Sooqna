export type AuthPageMode = "login" | "signup";

export type UnverifiedRecoveryState = {
  hasUser: boolean;
  emailVerified: boolean;
  authLoading: boolean;
  authPageMode: AuthPageMode;
};

export function shouldShowUnverifiedRecovery({
  hasUser,
  emailVerified,
  authLoading,
  authPageMode,
}: UnverifiedRecoveryState): boolean {
  return !authLoading && hasUser && !emailVerified && (authPageMode === "login" || authPageMode === "signup");
}

export function shouldRedirectSignedInFromAuthPage({
  hasUser,
  emailVerified,
  authLoading,
}: UnverifiedRecoveryState): boolean {
  return !authLoading && hasUser && emailVerified;
}

export function shouldBlockVerifiedAction({
  hasUser,
  emailVerified,
  authLoading,
}: {
  hasUser: boolean;
  emailVerified: boolean;
  authLoading: boolean;
}): boolean {
  return !authLoading && hasUser && !emailVerified;
}

export function shouldDisableAuthControls({
  busy,
  authLoading,
  authInitTimedOut,
}: {
  busy: boolean;
  authLoading: boolean;
  authInitTimedOut: boolean;
}): boolean {
  return busy || (authLoading && !authInitTimedOut);
}
