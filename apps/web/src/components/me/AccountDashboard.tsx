"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";

export function AccountDashboard() {
  const { currentUser } = useAuth();

  const displayName = useMemo(() => {
    if (!currentUser) return "";
    return currentUser.displayName || currentUser.email || currentUser.uid;
  }, [currentUser]);

  return (
    <RequireAuthGate fallbackMessage="جاري تحميل لوحة الحساب...">
      <div className="space-y-5">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold">مرحبًا، {displayName}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            هذه لوحة الحساب الخاصة بك في نسخة React. كل البيانات تعتمد على خدمات Milestone 1.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashLinkCard
            title="إضافة إعلان"
            description="أنشئ إعلان جديد وارفع الصور."
            href="/submit-listing"
          />
          <DashLinkCard
            title="إعلاناتي"
            description="إدارة إعلاناتك وتعديلها."
            href="/my-listings"
          />
          <DashLinkCard
            title="المفضلة"
            description="راجع الإعلانات المحفوظة."
            href="/favorites"
          />
          <DashLinkCard
            title="الرسائل"
            description="ادخل على المحادثات والرسائل."
            href="/messages"
          />
          <DashLinkCard
            title="إعدادات الحساب"
            description="تعديل الاسم والصورة الشخصية."
            href="/me/settings"
          />
          <DashLinkCard
            title="الإعلانات"
            description="تصفح كل الإعلانات المنشورة."
            href="/listings"
          />
          <DashLinkCard title="التصنيفات" description="استكشف أقسام المنصة." href="/categories" />
          <DashLinkCard title="اختبار المطور" description="لوحة dev للاختبارات." href="/dev-tools" />
        </section>
      </div>
    </RequireAuthGate>
  );
}

function DashLinkCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-[var(--brand)] hover:shadow"
    >
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
    </Link>
  );
}
