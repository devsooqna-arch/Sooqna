import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرف على سوقنا وقصتنا",
};

export default function AboutPage() {
  return (
    <PublicShell pageTitle="من نحن" pageDescription="سوقك الإلكتروني في الأردن">
      <div className="prose prose-lg max-w-3xl mx-auto text-[var(--text)] leading-relaxed space-y-6">
        <p className="text-[var(--text-muted)]">
          <strong className="text-[var(--text)]">سوقنا</strong> هو المنصة الرائدة للإعلانات المبوبة في الأردن، أُسست عام 2026 بهدف
          توفير بيئة بيع وشراء آمنة وسهلة لكل الأردنيين.
        </p>
        <p className="text-[var(--text-muted)]">
          نؤمن بأن كل شخص يستحق أن يجد ما يبحث عنه بسرعة وأمان — سواء كنت تبيع
          سيارة، تبحث عن شقة، أو تحتاج موظفاً.
        </p>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 not-prose">
          <h2 className="text-lg font-bold text-[var(--text)]">أرقامنا</h2>
          <ul className="mt-3 list-disc space-y-2 pe-5 text-sm text-[var(--text-muted)]">
            <li>+10,000 إعلان نشط</li>
            <li>+50,000 مستخدم مسجل</li>
            <li>10 تصنيفات متنوعة</li>
            <li>خدمة مجانية 100%</li>
          </ul>
        </div>
        <p className="text-[var(--text-muted)]">
          <strong className="text-[var(--text)]">رؤيتنا:</strong> أن نكون الوجهة الأولى للبيع والشراء في الأردن والمنطقة.
        </p>
        <p className="text-[var(--text-muted)]">
          <strong className="text-[var(--text)]">مهمتنا:</strong> ربط البائعين بالمشترين بطريقة آمنة وشفافة وسهلة الاستخدام.
        </p>
        <p className="text-[var(--text-muted)]">
          تواصل معنا:{" "}
          <a href="mailto:info@sooqna.com" className="font-semibold text-[var(--brand)] hover:underline">
            info@sooqna.com
          </a>
        </p>
      </div>
    </PublicShell>
  );
}
