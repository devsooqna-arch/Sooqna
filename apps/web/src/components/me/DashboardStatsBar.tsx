"use client";

import { getMotionStaggerStyle } from "@/lib/motion";

export type DashboardStats = {
  activeListings: number;
  favoritesCount: number;
  unreadMessages: number;
  totalSold: number;
};

const STAT_ITEMS: { key: keyof DashboardStats; label: string; icon: string }[] = [
  { key: "activeListings", label: "إعلاناتي النشطة", icon: "📋" },
  { key: "favoritesCount", label: "المفضلة", icon: "❤️" },
  { key: "unreadMessages", label: "رسائل غير مقروءة", icon: "💬" },
  { key: "totalSold", label: "تم البيع", icon: "✅" },
];

export function DashboardStatsBar({
  stats,
  loading,
}: {
  stats: DashboardStats | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="motion-skeleton h-24 rounded-2xl bg-[var(--surface)]"
            style={getMotionStaggerStyle(i)}
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_ITEMS.map((item, index) => (
        <div
          key={item.key}
          className="motion-card flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
          style={getMotionStaggerStyle(index)}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-2xl font-extrabold text-[var(--text)]">
            {stats[item.key]}
          </span>
          <span className="text-xs text-[var(--text-muted)]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
