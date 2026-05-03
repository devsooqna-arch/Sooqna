import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "المساعدة",
  description: "الأسئلة الشائعة ومركز المساعدة في سوقنا",
};

export default function HelpPage() {
  return (
    <PublicShell pageTitle="المساعدة والأسئلة الشائعة" pageDescription="مركز المساعدة 💬">
      <article className="max-w-3xl mx-auto space-y-8 text-[var(--text-muted)]">
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--text)]">كيف أنشر إعلاناً؟</h2>
          <p>اضغط «+ أعلن» في الشريط العلوي، أدخل التفاصيل والصور، وانشر مجاناً!</p>
        </section>
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--text)]">هل النشر مجاني؟</h2>
          <p>نعم، النشر الأساسي مجاني 100%. الإعلانات المميزة متاحة بأسعار رمزية.</p>
        </section>
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--text)]">كيف أتواصل مع البائع؟</h2>
          <p>افتح صفحة الإعلان واضغط «راسل البائع» لبدء محادثة مباشرة.</p>
        </section>
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--text)]">كيف أحذف إعلاناً؟</h2>
          <p>اذهب إلى «إعلاناتي» ← «تعديل» ← «حذف الإعلان».</p>
        </section>
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--text)]">نسيت كلمة المرور؟</h2>
          <p>اضغط «نسيت كلمة المرور» في صفحة تسجيل الدخول.</p>
        </section>
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--text)]">كيف أبلغ عن إعلان مشبوه؟</h2>
          <p>افتح الإعلان واضغط «الإبلاغ عن الإعلان» في أسفل الصفحة.</p>
        </section>
        <p className="text-center text-sm">
          لم تجد إجابتك؟ راسلنا:{" "}
          <a href="mailto:support@sooqna.com" className="font-semibold text-[var(--brand)] hover:underline">
            support@sooqna.com
          </a>
        </p>
        <div className="flex justify-center">
          <Link href="/listings" className="ui-btn-primary rounded-full px-8 py-2 text-sm font-semibold">
            تصفّح الإعلانات
          </Link>
        </div>
      </article>
    </PublicShell>
  );
}
