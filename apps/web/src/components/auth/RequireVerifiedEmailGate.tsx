"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/services/authService";
import { shouldBlockVerifiedAction } from "./authRecovery";
import { getResendVerificationState } from "./resendVerificationState";

export function RequireVerifiedEmailGate({ children }: { children: ReactNode }) {
  const { currentUser, loading, resendEmailVerification } = useAuth();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blocked = shouldBlockVerifiedAction({
    hasUser: Boolean(currentUser),
    emailVerified: Boolean(currentUser?.emailVerified),
    authLoading: loading,
  });
  const resendState = getResendVerificationState({
    sending,
    cooldownRemainingSeconds: cooldown,
  });

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (resendState.disabled) return;
    setSending(true);
    setMessage(null);
    setError(null);
    try {
      await resendEmailVerification();
      setCooldown(60);
      setMessage("تم إرسال رابط التفعيل. افحص البريد الوارد أو البريد غير الهام.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (!blocked) {
    return <>{children}</>;
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
      <h2 className="text-lg font-bold">فعّل بريدك قبل إضافة إعلان</h2>
      <p className="mt-2 text-sm leading-7">
        حسابك مسجل ويمكنك الدخول والتصفح، لكن إضافة الإعلانات تحتاج تفعيل البريد الإلكتروني أولاً.
      </p>
      <p className="mt-2 break-all text-xs font-semibold">{currentUser?.email}</p>

      {message ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={resendState.disabled}
          className="rounded-full bg-amber-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-50"
        >
          {sending ? resendState.label : resendState.label.replace("التحقق", "التفعيل")}
        </button>
        <Link
          href="/me/settings"
          className="rounded-full border border-amber-300 bg-white px-5 py-2 text-center text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
        >
          إعدادات الحساب
        </Link>
        <Link
          href="/listings"
          className="rounded-full border border-amber-300 bg-white px-5 py-2 text-center text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
        >
          تصفح الإعلانات
        </Link>
      </div>
      {resendState.helpText ? (
        <p className="mt-2 text-xs text-amber-900/80">{resendState.helpText}</p>
      ) : null}
    </section>
  );
}
