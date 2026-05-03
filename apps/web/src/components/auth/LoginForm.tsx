"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage, verifyRecaptchaIfEnabled } from "@/services/authService";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function readNextPathFromUrl(): string {
  if (typeof window === "undefined") return "/me";
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("next") ?? params.get("returnTo");
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/me";
}

type LoginFormProps = {
  mode?: "login" | "signup";
};

export function LoginForm({ mode = "login" }: LoginFormProps) {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/me");
  const isSignup = mode === "signup";

  const { currentUser, loading: authLoading, register, login, loginWithGoogle, resendEmailVerification } =
    useAuth();

  useEffect(() => {
    setNextPath(readNextPathFromUrl());
  }, []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // Already signed in → /me (or ?next=…)
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.replace(nextPath);
    }
  }, [authLoading, currentUser, router, nextPath]);

  function validateForm(): boolean {
    const next: { fullName?: string; email?: string; password?: string } = {};
    if (isSignup && !fullName.trim()) {
      next.fullName = "الاسم الكامل مطلوب.";
    }
    if (!email.trim()) {
      next.email = "البريد الإلكتروني مطلوب.";
    } else if (!isValidEmail(email)) {
      next.email = "أدخل بريداً إلكترونياً صالحاً.";
    }
    if (!password) {
      next.password = "كلمة المرور مطلوبة.";
    } else if (isSignup && password.length < 6) {
      next.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await verifyRecaptchaIfEnabled(isSignup ? "signup" : "login");
      if (isSignup) {
        const result = await register(email, password, fullName);
        if (!result.emailVerified) {
          setVerificationRequired(true);
          return;
        }
      } else {
        const result = await login(email, password);
        if (!result.emailVerified) {
          setVerificationRequired(true);
          return;
        }
      }
      setSuccess(true);
      router.replace(nextPath);
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setSubmitError(null);
    setGoogleLoading(true);
    try {
      await verifyRecaptchaIfEnabled("login");
      await loginWithGoogle();
      // signInWithRedirect navigates away; completion is handled by getRedirectResult + onAuthStateChanged.
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
      setGoogleLoading(false);
    }
  }

  async function handleResendVerification() {
    setSubmitError(null);
    setResendingVerification(true);
    try {
      await resendEmailVerification();
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
    } finally {
      setResendingVerification(false);
    }
  }

  const busy = submitting || googleLoading;
  /** Do not block the whole UI on auth init — avoids infinite "جاري التحميل" if Auth stalls. */
  const showForm = !currentUser;

  if (!showForm) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-slate-500">جاري التوجيه…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-5">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-[var(--text)]">
          {isSignup ? "إنشاء حساب جديد" : "تسجيل الدخول"}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {isSignup
            ? "ابدأ حسابك خلال دقيقة، أو استخدم جوجل للمتابعة بسرعة."
            : "أدخل بياناتك للوصول إلى حسابك، أو تابع مباشرة عبر جوجل."}
        </p>
        {authLoading && (
          <p className="mt-2 text-xs text-slate-400">جاري التحقق من الجلسة…</p>
        )}
      </div>

      {success && (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800"
          role="status"
        >
          تم تسجيل الدخول بنجاح
        </div>
      )}

      {submitError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {verificationRequired && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900"
          role="status"
        >
          <p>يرجى التحقق من بريدك الإلكتروني قبل متابعة الدخول.</p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendingVerification}
            className="mt-2 rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold transition hover:bg-amber-100 disabled:opacity-60"
          >
            {resendingVerification ? "جاري إعادة الإرسال..." : "إعادة إرسال رابط التحقق"}
          </button>
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
        {isSignup && (
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
            >
              الاسم الكامل
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="ui-input w-full"
              placeholder="الاسم الكامل"
              disabled={busy || authLoading}
              aria-invalid={!!fieldErrors.fullName}
              aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
            />
            {fieldErrors.fullName && (
              <p id="fullName-error" className="mt-1 text-xs text-red-600">
                {fieldErrors.fullName}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
          >
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((p) => ({ ...p, email: undefined }));
              }
            }}
            className="ui-input w-full"
            placeholder="you@example.com"
            disabled={busy || authLoading}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
          >
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((p) => ({ ...p, password: undefined }));
              }
            }}
            className="ui-input w-full"
            placeholder="••••••••"
            disabled={busy || authLoading}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-600">
              {fieldErrors.password}
            </p>
          )}
          {!isSignup ? (
            <div className="mt-2 text-end">
              <Link
                href="/reset-password"
                className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--brand)]"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={busy || authLoading}
          className="ui-btn-primary flex w-full gap-2 rounded-full py-2.5"
        >
          {submitting ? (
            <>
              <Spinner tone="light" />
              {isSignup ? "جاري إنشاء الحساب…" : "جاري تسجيل الدخول…"}
            </>
          ) : (
            isSignup ? "إنشاء الحساب" : "تسجيل الدخول"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)]">
        {isSignup ? "عندك حساب بالفعل؟" : "ما عندك حساب؟"}{" "}
        <Link
          href={isSignup ? "/login" : "/register"}
          className="font-semibold text-[var(--brand)]"
        >
          {isSignup ? "ارجع لتسجيل الدخول" : "إنشاء حساب جديد"}
        </Link>
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--surface)] px-2 text-[var(--text-muted)]">أو</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={busy || authLoading}
        className="ui-btn-ghost flex w-full gap-2 rounded-full border-[var(--chip-border)] bg-[var(--chip)] py-2.5 text-[var(--text)]"
      >
        {googleLoading ? (
          <>
            <Spinner tone="dark" />
            جاري الاتصال بـ جوجل…
          </>
        ) : (
          <>
            <GoogleIcon />
            {isSignup ? "إنشاء حساب عبر جوجل" : "المتابعة مع جوجل"}
          </>
        )}
      </button>
    </div>
  );
}

function Spinner({ tone }: { tone: "light" | "dark" }) {
  const border =
    tone === "light"
      ? "border-white border-t-transparent"
      : "border-slate-300 border-t-slate-800";
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${border}`}
      aria-hidden
    />
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
