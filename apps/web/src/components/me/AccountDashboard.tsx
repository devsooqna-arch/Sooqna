"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getBackendMe, type BackendProfile } from "@/services/backendAuthService";
import { getUserFavoriteListingIds } from "@/services/favoriteService";
import { getUnreadSummary } from "@/services/messageService";
import { ModernAvatar } from "@/components/ui/ModernAvatar";
import { getMotionStaggerStyle } from "@/lib/motion";
import { DashboardStatsBar, type DashboardStats } from "@/components/me/DashboardStatsBar";

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
];

const DEV_ONLY_CARD: DashCard = {
  title: "لوحة الإدارة",
  description: "إدارة الإعلانات والبلاغات والمستخدمين",
  href: "/admin",
  icon: "🛠️",
};

export function AccountDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    setStatsLoading(true);

    Promise.all([
      getBackendMe(),
      getUserFavoriteListingIds(currentUser.uid).catch(() => [] as string[]),
      getUnreadSummary().catch(() => ({ totalUnread: 0, byConversation: {} })),
    ])
      .then(([profileData, favIds, unread]) => {
        if (!mounted) return;
        setProfile(profileData);
        setStats({
          activeListings: profileData?.totalListings ?? 0,
          favoritesCount: favIds.length,
          unreadMessages: unread.totalUnread,
          totalSold: profileData?.totalSold ?? 0,
        });
      })
      .catch(() => {
        if (mounted) setProfile(null);
      })
      .finally(() => {
        if (mounted) setStatsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const displayName = useMemo(() => {
    if (profile?.fullName) return profile.fullName;
    if (!currentUser) return "";
    return currentUser.displayName || currentUser.email?.split("@")[0] || "المستخدم";
  }, [currentUser, profile]);

  const photoURL = profile?.photoURL || currentUser?.photoURL || "";

  /** لا تُظهر لوحة المطور إلا بعد تأكيد دور ADMIN من الـ backend */
  const showDeveloperTile = profile?.role === "ADMIN";

  const dashCards = useMemo(() => {
    if (showDeveloperTile) {
      return [...DASH_CARDS, DEV_ONLY_CARD];
    }
    return DASH_CARDS;
  }, [showDeveloperTile]);

  return (
    <RequireAuthGate fallbackMessage="جاري تحميل لوحة الحساب...">
      <div className="space-y-6">
        {/* Welcome banner */}
        <section className="motion-section relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="absolute inset-0 bg-gradient-to-l from-[var(--accent-soft)] to-transparent opacity-60" />
          <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-start">
            <ModernAvatar
              src={photoURL}
              name={displayName}
              size="lg"
              status="online"
              verified={Boolean(profile?.isEmailVerified ?? currentUser?.emailVerified)}
            />
            <div>
              <p className="text-xs text-[var(--text-muted)]">مرحباً بعودتك</p>
              <h2 className="text-2xl font-extrabold text-[var(--text)]">{displayName}</h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{currentUser?.email}</p>
            </div>
          </div>
        </section>

        {/* Stats overview */}
        <DashboardStatsBar stats={stats} loading={statsLoading} />

        {/* Dashboard grid */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {dashCards.map((card, index) => (
            <DashLinkCard key={card.href} motionIndex={index} {...card} />
          ))}
        </section>
      </div>
    </RequireAuthGate>
  );
}

function DashLinkCard({ title, description, href, icon, accent, motionIndex = 0 }: DashCard & { motionIndex?: number }) {
  return (
    <Link
      href={href}
      className={`ui-card ui-card-hover motion-card group rounded-2xl border p-5 ${
        accent
          ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-contrast)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]"
      }`}
      style={getMotionStaggerStyle(motionIndex)}
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
