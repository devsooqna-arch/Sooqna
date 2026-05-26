import {
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  inMemoryPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { apiFetch } from "@/services/apiClient";
import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "./authErrors";
import {
  getEmailActionSettingsForOrigin,
  sendPasswordResetWithLogging,
  sendVerificationEmailWithLogging,
} from "./authEmailSenders";

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

export async function sendPasswordResetLink(email: string): Promise<void> {
  await ensureAuthPersistence();
  await sendPasswordResetWithLogging(email, getEmailActionSettings("/login"), (target, settings) =>
    sendPasswordResetEmail(auth, target, settings)
  );
}

export async function sendVerificationEmailToCurrentUser(): Promise<void> {
  await ensureAuthPersistence();
  if (!auth.currentUser) {
    throw new Error("لا يوجد مستخدم مسجل حالياً.");
  }
  await sendVerificationEmailWithLogging(auth.currentUser, getEmailActionSettings("/login"), sendEmailVerification);
}

function getEmailActionSettings(path: string) {
  if (typeof window === "undefined") return undefined;
  return getEmailActionSettingsForOrigin(window.location.origin, path);
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

async function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.grecaptcha) return;

  const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha="v3"]');
  if (existing) {
    await new Promise<void>((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "v3";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA script."));
    document.head.appendChild(script);
  });
}

export async function verifyRecaptchaIfEnabled(action: "signup" | "login"): Promise<void> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();
  let token = "";

  if (siteKey && typeof window !== "undefined") {
    await loadRecaptchaScript(siteKey);
    if (window.grecaptcha) {
      token = await new Promise<string>((resolve, reject) => {
        window.grecaptcha!.ready(() => {
          window.grecaptcha!
            .execute(siteKey, { action })
            .then(resolve)
            .catch(() => reject(new Error("تعذر التحقق من reCAPTCHA.")));
        });
      });
    }
  }

  await apiFetch<{ success: true; data: { verified: boolean } }>("/auth/recaptcha/verify", {
    method: "POST",
    body: JSON.stringify(token ? { token } : {}),
  });
}

/**
 * Maps Firebase Auth error codes to user-facing Arabic messages.
 * Reusable for login and future signup flows.
 */
export { getAuthErrorMessage };
