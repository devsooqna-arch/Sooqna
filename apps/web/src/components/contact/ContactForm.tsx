"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [hint, setHint] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const subject = String(fd.get("subject") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const body = encodeURIComponent(
      `الاسم: ${name}\nالبريد: ${email}\n\n${message}`
    );
    const sub = encodeURIComponent(subject || "تواصل من موقع سوقنا");
    window.location.href = `mailto:support@sooqna.com?subject=${sub}&body=${body}`;
    setHint("إذا لم يُفتح تطبيق البريد تلقائياً، يمكنك مراسلتنا يدوياً على support@sooqna.com");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--text)]">الاسم</span>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            placeholder="اسمك الكامل"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--text)]">البريد الإلكتروني</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="space-y-1">
        <span className="text-sm font-medium text-[var(--text)]">الموضوع</span>
        <input
          name="subject"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          placeholder="موجز لطلبك"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium text-[var(--text)]">الرسالة</span>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          placeholder="اكتب رسالتك هنا..."
        />
      </label>
      <button type="submit" className="ui-btn-primary w-full rounded-full py-3 text-sm font-semibold sm:w-auto sm:px-10">
        إرسال عبر البريد
      </button>
      {hint ? <p className="text-xs text-[var(--text-muted)]">{hint}</p> : null}
    </form>
  );
}
