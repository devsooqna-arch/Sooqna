import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "قنوات التواصل مع فريق سوقنا",
};

export default function ContactPage() {
  return (
    <PublicShell pageTitle="اتصل بنا" pageDescription="نحن هنا لمساعدتك">
      <div className="max-w-3xl mx-auto space-y-6 text-[var(--text-muted)]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 sm:p-6">
          <p className="font-semibold text-[var(--text)]">للشكاوى والاستفسارات العامة:</p>
          <p>
            📧{" "}
            <a href="mailto:info@sooqna.com" className="text-[var(--brand)] hover:underline">
              info@sooqna.com
            </a>
          </p>
          <p className="mt-4 font-semibold text-[var(--text)]">للإعلانات والشراكات:</p>
          <p>
            📧{" "}
            <a href="mailto:ads@sooqna.com" className="text-[var(--brand)] hover:underline">
              ads@sooqna.com
            </a>
          </p>
          <p className="mt-4 font-semibold text-[var(--text)]">لدعم المستخدمين:</p>
          <p>
            📧{" "}
            <a href="mailto:support@sooqna.com" className="text-[var(--brand)] hover:underline">
              support@sooqna.com
            </a>
          </p>
          <p className="mt-4 text-[var(--text)]">🕐 أوقات العمل: الأحد – الخميس، 9 صباحاً – 5 مساءً</p>
          <p className="mt-2">العنوان: عمّان، الأردن</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--text)]">نموذج التواصل</h2>
          <ContactForm />
        </section>
      </div>
    </PublicShell>
  );
}
