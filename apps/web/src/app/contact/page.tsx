import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "اتصل بنا | سوقنا",
  description: "قنوات التواصل مع فريق سوقنا.",
};

export default function ContactPage() {
  return (
    <PublicShell pageTitle="اتصل بنا" pageDescription="يمكنك التواصل مع فريق سوقنا لأي استفسار أو دعم.">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text-muted)] sm:p-6">
        <p>سيتم ربط نموذج التواصل الفعلي ونقاط الاتصال الرسمية ضمن باقة صفحات المحتوى الثابتة.</p>
      </section>
    </PublicShell>
  );
}
