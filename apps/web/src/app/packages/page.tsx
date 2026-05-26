import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "الباقات الإعلانية",
  description: "أبرز إعلانك على سوقنا",
};

export default function PackagesPage() {
  const packages = [
    {
      name: "إعلان مجاني",
      status: "متاح الآن",
      description: "نشر إعلان أساسي مع الصور، الرسائل، والظهور في نتائج البحث حسب الأحدث والملاءمة.",
      points: ["نشر مجاني", "إدارة الإعلان من لوحة الحساب", "إحصاءات أساسية للمشاهدات والتفاعل"],
    },
    {
      name: "إعلان مميز",
      status: "قريباً",
      description: "ظهور أوضح في الصفحة الرئيسية ونتائج البحث عبر شارة مميز وترتيب أعلى عند توفر المساحة.",
      points: ["شارة مميز", "أولوية ظهور آمنة", "تفعيل من الإدارة حتى إطلاق الدفع"],
    },
    {
      name: "تعزيز الإعلان",
      status: "قيد التخطيط",
      description: "دفعة قصيرة المدى لإعادة الإعلان إلى أعلى النتائج لفترة محددة بدون تغيير بيانات الإعلان.",
      points: ["مدة تعزيز واضحة", "تقارير أداء بعد الحملة", "بدون دفع مباشر حالياً"],
    },
    {
      name: "باقة بائع تجاري",
      status: "قيد التخطيط",
      description: "حل مستقبلي للبائعين والشركات التي تحتاج حضوراً أكبر وإدارة أفضل لعدة إعلانات.",
      points: ["ملف تجاري", "عدد إعلانات أعلى", "خيارات دعم وتقارير أوسع"],
    },
  ];

  return (
    <PublicShell
      pageTitle="الباقات الإعلانية"
      pageDescription="خيارات نمو آمنة للبائعين — بدون دفع إلكتروني مباشر في هذه المرحلة."
    >
      <div className="mx-auto max-w-5xl space-y-8 text-[var(--text-muted)]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-extrabold text-[var(--text)]">حالة الباقات</h2>
          <p className="mt-2 text-sm leading-7">
            سوقنا لا يشغّل الدفع الإلكتروني أو أي checkout داخل الموقع حالياً. التمييز والتعزيز التجاريان
            قيد التحضير، ويمكن لفريق الإدارة تفعيل الظهور المميز يدوياً عند الحاجة إلى حملة تجريبية أو شراكة.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((item) => (
            <article key={item.name} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-extrabold text-[var(--text)]">{item.name}</h2>
                <span className="rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7">{item.description}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {item.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-contrast)] transition hover:opacity-90"
          >
            تواصل لتجربة باقة
          </Link>
          <Link
            href="/submit-listing"
            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]"
          >
            نشر إعلان مجاني
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
