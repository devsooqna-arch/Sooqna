import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "شروط الاستخدام | سوقنا",
  description: "شروط استخدام منصة سوقنا.",
};

export default function TermsPage() {
  return (
    <PublicShell pageTitle="شروط الاستخدام" pageDescription="الإطار القانوني لاستخدام المنصة سيكتمل ضمن صفحات المحتوى الرسمي.">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text-muted)] sm:p-6">
        <p>سيتم إدراج النسخة النهائية من شروط الاستخدام وسياسة الخصوصية قبل الإطلاق الرسمي.</p>
      </section>
    </PublicShell>
  );
}
