type CompleteSignupVerificationInput = {
  emailVerified: boolean;
  resendEmailVerification: () => Promise<void>;
};

type CompleteSignupVerificationResult = {
  message: string;
  shouldRedirect: boolean;
};

export async function completeSignupVerification({
  emailVerified,
  resendEmailVerification,
}: CompleteSignupVerificationInput): Promise<CompleteSignupVerificationResult> {
  if (emailVerified) {
    return {
      message: "تم إنشاء الحساب بنجاح.",
      shouldRedirect: true,
    };
  }

  await resendEmailVerification();

  return {
    message: "تم إنشاء الحساب وإرسال رابط التحقق إلى بريدك الإلكتروني.",
    shouldRedirect: false,
  };
}
