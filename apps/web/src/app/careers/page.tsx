import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "الوظائف",
  description: "انضم إلى فريق سوقنا",
};

export default function CareersPage() {
  return (
    <PublicShell pageTitle="الوظائف" pageDescription="انضم إلى فريق سوقنا 🚀">
      <article className="prose prose-lg max-w-3xl mx-auto text-[var(--text)] leading-relaxed space-y-6">
        <p className="text-[var(--text-muted)]">
          نحن نبني مستقبل التجارة الإلكترونية في سوريا ونبحث عن موهوبين شغوفين — مقرنا الرئيسي في حلب.
        </p>
        <h2 className="text-xl font-bold">وظائف متاحة حالياً</h2>
        <ul className="space-y-4 text-[var(--text-muted)]">
          <li>
            <strong className="text-[var(--text)]">مطوّر Full Stack (React / Node.js)</strong>
            <br />
            حلب | دوام كامل
          </li>
          <li>
            <strong className="text-[var(--text)]">مصمم UI/UX</strong>
            <br />
            حلب | دوام كامل أو جزئي
          </li>
          <li>
            <strong className="text-[var(--text)]">مسؤول دعم العملاء (عربي/إنجليزي)</strong>
            <br />
            حلب | دوام كامل
          </li>
          <li>
            <strong className="text-[var(--text)]">مسؤول تسويق رقمي</strong>
            <br />
            حلب | دوام كامل
          </li>
        </ul>
        <p className="text-[var(--text-muted)]">
          للتقديم أرسل سيرتك الذاتية إلى{" "}
          <a href="mailto:careers@sooqna.com" className="text-[var(--brand)] hover:underline">
            careers@sooqna.com
          </a>{" "}
          مع ذكر المسمى الوظيفي في عنوان البريد.
        </p>
      </article>
    </PublicShell>
  );
}
