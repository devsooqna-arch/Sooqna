export type AccountSettingsActionState = {
  canSendPasswordReset: boolean;
  canResendVerification: boolean;
  passwordHelpText: string;
  showLogout: true;
};

type AccountSettingsActionInput = {
  hasEmail: boolean;
  hasEmailPasswordProvider: boolean;
  emailVerified: boolean;
};

export function getAccountSettingsActionState({
  hasEmail,
  hasEmailPasswordProvider,
  emailVerified,
}: AccountSettingsActionInput): AccountSettingsActionState {
  return {
    canSendPasswordReset: hasEmail,
    canResendVerification: hasEmail && !emailVerified,
    passwordHelpText: hasEmailPasswordProvider
      ? "نرسل رابطاً آمناً إلى بريدك لتغيير كلمة المرور."
      : "يمكنك طلب رابط عبر البريد إذا أردت إضافة أو استعادة طريقة دخول بكلمة مرور.",
    showLogout: true,
  };
}
