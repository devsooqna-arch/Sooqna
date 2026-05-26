type EmailActionSettings = {
  url: string;
  handleCodeInApp: boolean;
};

type Logger = Pick<Console, "info" | "warn">;

export type VerificationEmailUser = {
  uid: string;
  emailVerified: boolean;
};

export function getEmailActionSettingsForOrigin(origin: string, path: string): EmailActionSettings {
  return {
    url: `${origin}${path}`,
    handleCodeInApp: false,
  };
}

export async function sendPasswordResetWithLogging(
  email: string,
  actionSettings: EmailActionSettings | undefined,
  sendFn: (email: string, actionSettings?: EmailActionSettings) => Promise<void>,
  logger: Logger = console
): Promise<void> {
  const target = email.trim();
  logger.info("[AuthEmail] password reset send attempt", {
    hasEmail: Boolean(target),
  });
  try {
    await sendFn(target, actionSettings);
    logger.info("[AuthEmail] password reset send accepted");
  } catch (error) {
    logger.warn("[AuthEmail] password reset send failed", {
      code: getFirebaseErrorCode(error),
    });
    throw error;
  }
}

export async function sendVerificationEmailWithLogging<TUser extends VerificationEmailUser>(
  user: TUser,
  actionSettings: EmailActionSettings | undefined,
  sendFn: (user: TUser, actionSettings?: EmailActionSettings) => Promise<void>,
  logger: Logger = console
): Promise<void> {
  logger.info("[AuthEmail] verification send attempt", {
    uid: user.uid,
    emailVerified: user.emailVerified,
  });
  try {
    await sendFn(user, actionSettings);
    logger.info("[AuthEmail] verification send accepted", {
      uid: user.uid,
    });
  } catch (error) {
    logger.warn("[AuthEmail] verification send failed", {
      uid: user.uid,
      code: getFirebaseErrorCode(error),
    });
    throw error;
  }
}

function getFirebaseErrorCode(error: unknown): string {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code?: string }).code)
    : "unknown";
}
