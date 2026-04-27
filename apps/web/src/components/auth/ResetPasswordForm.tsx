"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getAuthErrorMessage, sendPasswordResetLink } from "@/services/authService";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("أدخل بريدًا إلكترونيًا صحيحًا.");
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordResetLink(email);
      setSuccess("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">استعادة كلمة المرور</h1>
        <p className="mt-2 text-sm text-slate-500">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="resetEmail" className="mb-1.5 block text-sm font-medium text-slate-700">
            البريد الإلكتروني
          </label>
          <input
            id="resetEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-slate-400 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
            placeholder="you@example.com"
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        تذكرت كلمة المرور؟{" "}
        <Link href="/login" className="font-medium text-slate-900 underline underline-offset-2">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
