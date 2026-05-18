export function isEmailNotVerified(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("EMAIL_NOT_VERIFIED") || msg.includes("MAIL_NOT_VERIFIED");
}

export function friendlyErrorMessage(err: unknown): string {
  if (isEmailNotVerified(err)) {
    return "EMAIL_NOT_VERIFIED";
  }
  return err instanceof Error ? err.message : "حدث خطأ غير متوقع.";
}
