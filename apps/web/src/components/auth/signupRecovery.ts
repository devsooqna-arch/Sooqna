type AuthErrorLike = {
  code?: string;
};

export function isEmailAlreadyInUseError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return String((error as AuthErrorLike).code) === "auth/email-already-in-use";
}

export function getDuplicateSignupRecoveryMessage(): string {
  return "هذا البريد موجود مسبقاً في Firebase بحساب Google أو بطريقة دخول أخرى. استخدم المتابعة مع Google، أو سجّل الدخول، أو استخدم استعادة كلمة المرور إذا كان الحساب بكلمة مرور.";
}
