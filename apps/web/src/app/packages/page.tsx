import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "الباقات الإعلانية",
  description: "أبرز إعلانك على سوقنا",
};

export default function PackagesPage() {
  return (
    <PublicShell
      pageTitle="الباقات الإعلانية"
      pageDescription="حلول ظهور للشركات والأفراد — التفاصيل والأسعار حسب الحملة."
    >
      <div className="max-w-3xl mx-auto space-y-6 text-[var(--text-muted)]">
        <p>
          نعمل على باقات إعلانات مميزة داخل المنصة وخارجها. للحصول على عرض مخصص أو شراكة إعلانية، تواصل مع فريقنا.
        </p>
        <Link
          href="/contact"
          className="inline-flex rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-contrast)] transition hover:opacity-90"
        >
          طلب عرض أسعار
        </Link>
      </div>
    </PublicShell>
  );
}
