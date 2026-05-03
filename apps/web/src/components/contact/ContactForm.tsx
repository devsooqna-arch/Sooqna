"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);
    const form = e.currentTarget;
    const payload = {
      name: String(new FormData(form).get("name") ?? "").trim(),
      email: String(new FormData(form).get("email") ?? "").trim(),
      subject: String(new FormData(form).get("subject") ?? "").trim(),
      message: String(new FormData(form).get("message") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; dev?: boolean };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMessage(data.error || "تعذّر إرسال الرسالة. حاول مرة أخرى لاحقاً.");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("تعذّر الاتصال بالخادم. تحقق من الاتصال بالإنترنت.");
    }
  }

  if (status === "success") {
    return (
      <div
        className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
        role="status"
      >
        <p className="text-lg font-bold">تم إرسال رسالتك ✓</p>
        <p className="mt-2 text-sm opacity-90">سنعاود الاتصال بك عبر البريد الإلكتروني قريباً.</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setErrorMessage(null);
          }}
          className="mt-5 text-sm font-semibold text-[var(--brand)] underline hover:opacity-90"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--text)]">الاسم</span>
          <input
            name="name"
            required
            disabled={status === "sending"}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] disabled:opacity-60"
            placeholder="اسمك الكامل"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--text)]">البريد الإلكتروني</span>
          <input
            name="email"
            type="email"
            required
            disabled={status === "sending"}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] disabled:opacity-60"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="space-y-1">
        <span className="text-sm font-medium text-[var(--text)]">الموضوع</span>
        <input
          name="subject"
          disabled={status === "sending"}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] disabled:opacity-60"
          placeholder="موجز لطلبك"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium text-[var(--text)]">الرسالة</span>
        <textarea
          name="message"
          required
          rows={5}
          disabled={status === "sending"}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] disabled:opacity-60"
          placeholder="اكتب رسالتك هنا..."
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="ui-btn-primary w-full rounded-full py-3 text-sm font-semibold disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === "sending" ? "جاري الإرسال..." : "إرسال"}
      </button>
      {errorMessage ? <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p> : null}
    </form>
  );
}
