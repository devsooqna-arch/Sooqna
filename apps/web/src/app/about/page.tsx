import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "من نحن | سوقنا",
  description: "تعرف على منصة سوقنا.",
};

export default function AboutPage() {
  return (
    <PublicShell pageTitle="من نحن" pageDescription="سوقنا منصة إعلانات مبوبة تربط البائعين والمشترين بسهولة وأمان.">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text-muted)] sm:p-6">
        <p>
          هذه الصفحة سيتم استكمال محتواها ضمن Milestone 2 أثناء مرحلة توثيق صفحات المحتوى
          الثابتة (عن المنصة، المساعدة، شروط الاستخدام، الخصوصية).
        </p>
      </section>
    </PublicShell>
  );
}
