export type ResendVerificationStateInput = {
  sending: boolean;
  cooldownRemainingSeconds: number;
};

export type ResendVerificationState = {
  disabled: boolean;
  label: string;
  helpText: string | null;
};

export function getResendVerificationState({
  sending,
  cooldownRemainingSeconds,
}: ResendVerificationStateInput): ResendVerificationState {
  if (sending) {
    return {
      disabled: true,
      label: "جاري الإرسال...",
      helpText: null,
    };
  }

  if (cooldownRemainingSeconds > 0) {
    return {
      disabled: true,
      label: `يمكنك إعادة الإرسال بعد ${cooldownRemainingSeconds} ثانية`,
      helpText: "انتظر قليلاً قبل طلب رابط تحقق جديد.",
    };
  }

  return {
    disabled: false,
    label: "إعادة إرسال رابط التحقق",
    helpText: null,
  };
}
