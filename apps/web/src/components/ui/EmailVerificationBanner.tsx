"use client";

import Link from "next/link";

export function EmailVerificationBanner() {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      <span className="mt-0.5 text-lg leading-none">✉️</span>
      <div>
        <p className="font-semibold">يرجى تأكيد بريدك الإلكتروني</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-80">
          لم يتم التحقق من بريدك الإلكتروني بعد. بعض الميزات قد لا تعمل حتى تقوم بالتحقق.
        </p>
        <Link
          href="/me/settings"
          className="mt-2 inline-block rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
        >
          تأكيد البريد الإلكتروني
        </Link>
      </div>
    </div>
  );
}
