import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرف على سوقنا وقصتنا",
};

export default function AboutPage() {
  return (
    <PublicShell pageTitle="من نحن" pageDescription="تعرف على سوقنا وقصتنا">
      <div className="max-w-3xl space-y-8 text-[var(--text)]">

        {/* من نحن */}
        <section className="space-y-3">
          <p className="leading-relaxed text-[var(--text-muted)]">
            نحن منصة <strong className="text-[var(--text)]">سوقنا</strong> للإعلانات المبوبة، نسعى لتوفير تجربة متكاملة وسهلة لبيع وشراء مختلف المنتجات والخدمات بكل أمان وموثوقية.
          </p>
          <p className="leading-relaxed text-[var(--text-muted)]">
            نؤمن بأن الوصول إلى السوق يجب أن يكون بسيطًا وسريعًا للجميع، لذلك عملنا على بناء منصة تتيح للمستخدمين نشر إعلاناتهم والتواصل مع المشترين أو البائعين بكل سهولة، سواء كانوا أفرادًا أو شركات.
          </p>
        </section>

        {/* رؤيتنا ورسالتنا */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-2 text-base font-bold text-[var(--text)]">رؤيتنا</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              أن نصبح المنصة الأولى للإعلانات المبوبة في المنطقة، من خلال تقديم خدمات عالية الجودة وتجربة مستخدم متميزة.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-2 text-base font-bold text-[var(--text)]">رسالتنا</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              تمكين المستخدمين من عرض وشراء المنتجات والخدمات بطريقة سهلة، آمنة، وفعّالة، مع توفير بيئة موثوقة تعزز الثقة بين جميع الأطراف.
            </p>
          </div>
        </div>

        {/* ماذا نقدم */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-4 text-base font-bold text-[var(--text)]">ماذا نقدم؟</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              "نشر إعلانات بسهولة وسرعة",
              "تصفح مجموعة واسعة من الفئات",
              "تواصل مباشر بين البائع والمشتري",
              "تجربة استخدام بسيطة ومتطورة",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] text-[var(--brand-contrast)]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* قيمنا */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-4 text-base font-bold text-[var(--text)]">قيمنا</h2>
          <div className="flex flex-wrap gap-2">
            {["الشفافية", "الثقة", "البساطة", "التطوير المستمر"].map((value) => (
              <span
                key={value}
                className="rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-4 py-1.5 text-sm text-[var(--text)]"
              >
                {value}
              </span>
            ))}
          </div>
        </div>

        {/* أرقامنا */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-4 text-base font-bold text-[var(--text)]">أرقامنا</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: "+10,000", label: "إعلان نشط" },
              { value: "+50,000", label: "مستخدم مسجل" },
              { value: "10", label: "تصنيفات متنوعة" },
              { value: "100%", label: "خدمة مجانية" },
            ].map((stat) => (
              <li key={stat.label} className="text-center">
                <p className="text-xl font-extrabold text-[var(--brand)]">{stat.value}</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{stat.label}</p>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </PublicShell>
  );
}
