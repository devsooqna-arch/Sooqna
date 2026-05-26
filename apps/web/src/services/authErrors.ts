export function getAuthErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    case "auth/invalid-email":
      return "صيغة البريد الإلكتروني غير صالحة.";
    case "auth/user-disabled":
      return "تم تعطيل هذا الحساب.";
    case "auth/too-many-requests":
      return "تم إيقاف المحاولات مؤقتاً بسبب كثرة الطلبات. انتظر بضع دقائق ثم حاول مرة أخرى.";
    case "auth/popup-closed-by-user":
      return "تم إغلاق نافذة Google قبل إكمال تسجيل الدخول.";
    case "auth/popup-blocked":
      return "المتصفح حظر نافذة Google. اسمح بالنوافذ المنبثقة لهذا الموقع وحاول مرة أخرى.";
    case "auth/cancelled-popup-request":
      return "تم إلغاء طلب تسجيل الدخول.";
    case "auth/account-exists-with-different-credential":
      return "يوجد حساب بنفس البريد بطريقة تسجيل أخرى.";
    case "auth/network-request-failed":
      return "خطأ في الشبكة. تحقق من الاتصال.";
    case "auth/operation-not-allowed":
      return "تسجيل الدخول بهذه الطريقة غير مفعّل في Firebase. فعّل Google (و/أو البريد) من Authentication > Sign-in method.";
    case "auth/invalid-api-key":
      return "مفتاح Firebase غير صالح. تحقق من متغيرات NEXT_PUBLIC_* في .env.local.";
    case "auth/unauthorized-domain":
      return "هذا النطاق غير مسموح لإرسال روابط المصادقة. أضف نطاق الموقع في Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/internal-error":
      return "تعذر إكمال طلب المصادقة حالياً. حاول لاحقاً أو راجع إعدادات Firebase.";
    case "auth/email-already-in-use":
      return "هذا البريد مسجّل مسبقاً. سجّل الدخول أو استخدم بريداً آخر.";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.";
    default:
      if (code) {
        return `حدث خطأ (${code}). تحقق من إعدادات Firebase أو حاول مرة أخرى.`;
      }
      return "حدث خطأ غير متوقع. حاول مرة أخرى.";
  }
}
