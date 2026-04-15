import {
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

async function ensureAuthPersistence(): Promise<void> {
  // Embedded browsers can fail local persistence silently.
  // We try local -> session -> memory in order.
  try {
    await setPersistence(auth, browserLocalPersistence);
    return;
  } catch {
    /* fallback below */
  }

  try {
    await setPersistence(auth, browserSessionPersistence);
    return;
  } catch {
    /* fallback below */
  }

  await setPersistence(auth, inMemoryPersistence);
}

/**
 * Email/password sign-up. Throws Firebase errors — map with `getAuthErrorMessage`.
 */
export async function signUpWithEmailAndPassword(
  email: string,
  password: string
): Promise<UserCredential> {
  await ensureAuthPersistence();
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Email/password sign-in. Throws Firebase errors — map with `getAuthErrorMessage`.
 */
export async function loginWithEmailAndPassword(
  email: string,
  password: string
): Promise<UserCredential> {
  await ensureAuthPersistence();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Completes Google OAuth when the user returns from the redirect flow.
 * Call once on app load (e.g. in `AuthProvider`).
 */
export async function completeGoogleRedirectIfNeeded(): Promise<UserCredential | null> {
  await ensureAuthPersistence();
  return getRedirectResult(auth);
}

/**
 * Google OAuth via **popup** (per auth test / product flows).
 */
export async function loginWithGooglePopup(): Promise<UserCredential> {
  await ensureAuthPersistence();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

/**
 * Google OAuth via **redirect** (fallback when popup is blocked).
 * The page will navigate away; on return, `completeGoogleRedirectIfNeeded` finishes the session.
 *
 * Requires: Google sign-in enabled in Firebase Console, and this origin in **Authorized domains**
 * (e.g. `localhost` for dev).
 */
export async function loginWithGoogleRedirect(): Promise<void> {
  await ensureAuthPersistence();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Maps Firebase Auth error codes to user-facing Arabic messages.
 * Reusable for login and future signup flows.
 */
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
      return "محاولات كثيرة. يرجى المحاولة لاحقاً.";
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
      return "هذا النطاق غير مسموح. أضف النطاق في Firebase Console → Authentication → Settings → Authorized domains.";
    case "auth/internal-error":
      return "خطأ داخلي من خادم المصادقة. حاول لاحقاً أو تحقق من إعدادات المشروع.";
    case "auth/email-already-in-use":
      return "هذا البريد مسجّل مسبقاً. سجّل الدخول أو استخدم بريداً آخر.";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.";
    default:
      if (code) {
        return `حدث خطأ (${code}). تحقق من إعدادات Firebase أو حاول مرة أخرى.`;
      }
      return "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.";
  }
}
