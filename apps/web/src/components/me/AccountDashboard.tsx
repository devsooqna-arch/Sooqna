"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";

type DashCard = {
  title: string;
  description: string;
  href: string;
  icon: string;
  accent?: boolean;
};

const DASH_CARDS: DashCard[] = [
  { title: "إضافة إعلان",        description: "أنشئ إعلاناً جديداً وارفع الصور",   href: "/submit-listing", icon: "📢", accent: true },
  { title: "إعلاناتي",           description: "إدارة إعلاناتك وتعديلها",             href: "/my-listings",    icon: "📋" },
  { title: "المفضلة",            description: "راجع الإعلانات المحفوظة",             href: "/favorites",      icon: "❤️" },
  { title: "الرسائل",            description: "ادخل على المحادثات والرسائل",         href: "/messages",       icon: "💬" },
  { title: "إعدادات الحساب",    description: "تعديل الاسم والصورة الشخصية",         href: "/me/settings",    icon: "⚙️" },
  { title: "تصفح الإعلانات",    description: "اكتشف كل الإعلانات المنشورة",         href: "/listings",       icon: "🔍" },
  { title: "التصنيفات",          description: "استكشف أقسام المنصة",                href: "/categories",     icon: "🗂️" },
  { title: "لوحة المطور",        description: "أدوات الاختبار والتطوير",              href: "/dev-tools",      icon: "🛠️" },
];

export function AccountDashboard() {
  const { currentUser } = useAuth();

  const displayName = useMemo(() => {
    if (!currentUser) return "";
    return currentUser.displayName || currentUser.email?.split("@")[0] || "المستخدم";
  }, [currentUser]);

  return (
    <RequireAuthGate fallbackMessage="جاري تحميل لوحة الحساب...">
      <div className="space-y-6">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="absolute inset-0 bg-gradient-to-l from-[var(--accent-soft)] to-transparent opacity-60" />
          <div className="relative flex items-center gap-4">
            {currentUser?.photoURL ? (
              <Image
                src={currentUser.photoURL}
                alt={displayName}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-[var(--brand)] object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)] text-3xl text-[var(--brand-contrast)]">
                {displayName.charAt(0).toUpperCase() || "م"}
              </div>
            )}
            <div>
              <p className="text-xs text-[var(--text-muted)]">مرحباً بعودتك</p>
              <h2 className="text-2xl font-extrabold text-[var(--text)]">{displayName}</h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{currentUser?.email}</p>
            </div>
          </div>
        </section>

        {/* Dashboard grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DASH_CARDS.map((card) => (
            <DashLinkCard key={card.href} {...card} />
          ))}
        </section>
      </div>
    </RequireAuthGate>
  );
}

function DashLinkCard({ title, description, href, icon, accent }: DashCard) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-5 shadow-[var(--shadow)] transition hover:shadow-[var(--shadow-md)] ${
        accent
          ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-contrast)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]"
      }`}
    >
      <span className="mb-3 block text-3xl">{icon}</span>
      <h3 className={`text-sm font-bold ${accent ? "text-[var(--brand-contrast)]" : "text-[var(--text)]"}`}>
        {title}
      </h3>
      <p className={`mt-1 text-xs leading-relaxed ${accent ? "text-[var(--brand-contrast)]/80" : "text-[var(--text-muted)]"}`}>
        {description}
      </p>
    </Link>
  );
}
