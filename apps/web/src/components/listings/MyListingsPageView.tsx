"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getMyListings } from "@/services/listingService";
import type { Listing, ListingStatus } from "@/types/listing";
import { arabicCity } from "@/lib/locationNames";
import { isEmailNotVerified } from "@/lib/apiError";
import { EmailVerificationBanner } from "@/components/ui/EmailVerificationBanner";
import { getMotionStaggerStyle } from "@/lib/motion";
import { listingStatusLabel } from "@/lib/listingUiLabels";

const STATUS_COLORS: Record<ListingStatus, string> = {
  draft:     "bg-gray-100 text-gray-600",
  pending:   "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
  sold:      "bg-blue-100 text-blue-700",
  archived:  "bg-slate-100 text-slate-600",
};

type MyTab = "all" | "published" | "draft" | "ended";

function matchesMyTab(listing: Listing, tab: MyTab): boolean {
  if (tab === "all") return true;
  if (tab === "published") return listing.status === "published";
  if (tab === "draft") return listing.status === "draft";
  return listing.status === "sold" || listing.status === "archived" || listing.status === "rejected";
}

const TAB_OPTIONS: { id: MyTab; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "published", label: "منشورة" },
  { id: "draft", label: "مسودة" },
  { id: "ended", label: "منتهية" },
];

export function MyListingsPageView() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailUnverified, setEmailUnverified] = useState(false);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [tab, setTab] = useState<MyTab>("all");

  const filteredListings = useMemo(
    () => myListings.filter((l) => matchesMyTab(l, tab)),
    [myListings, tab]
  );

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    void getMyListings()
      .then((items) => { if (mounted) setMyListings(items); })
      .catch((err) => { if (!mounted) return; if (isEmailNotVerified(err)) setEmailUnverified(true); else setError(err instanceof Error ? err.message : "حدث خطأ أثناء تحميل إعلاناتك."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [currentUser]);

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل تحميل إعلاناتك...">
      {emailUnverified && <EmailVerificationBanner />}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="motion-skeleton h-20 rounded-xl bg-[var(--surface)]" />
          ))}
        </div>
      ) : error ? (
        <p className="motion-alert text-sm text-[var(--danger)]">{error}</p>
      ) : myListings.length ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
            {TAB_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tab === id
                    ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
                    : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredListings.length === 0 ? (
            <p className="motion-section rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              لا توجد إعلانات في هذا التبويب.
            </p>
          ) : null}

          <div className="space-y-3">
          {filteredListings.map((listing, index) => (
            <article
              key={listing.id}
              className="ui-card ui-card-hover motion-card flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
              style={getMotionStaggerStyle(index)}
            >
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text)]">{listing.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[listing.status]}`}>
                    {listingStatusLabel(listing.status)}
                  </span>
                  {listing.isFeatured && (
                    <span className="rounded-full bg-[var(--featured)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--featured-text)]">
                      مميز
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {listing.price} {listing.currency}
                  {listing.location.city ? ` • ${arabicCity(listing.location.city)}` : ""}
                  <span className="mx-1">•</span>
                  {listing.viewsCount} مشاهدة
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)] sm:grid-cols-3 lg:grid-cols-6">
                  <StatPill label="المشاهدات" value={String(listing.viewsCount)} />
                  <StatPill label="المفضلة" value={String(listing.favoritesCount)} />
                  <StatPill label="الرسائل" value={String(listing.messagesCount)} />
                  <StatPill label="النشر" value={formatDashboardDate(listing.publishedAt ?? listing.createdAt)} />
                  <StatPill label="الانتهاء" value={formatDashboardDate(listing.expiresAt ?? null)} />
                  <StatPill label="التمييز" value={listing.isFeatured ? "مميز" : "عادي"} />
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {listing.status === "published" && !listing.isFeatured && (
                  <Link
                    href="/packages"
                    className="rounded-full border border-[var(--featured)]/50 bg-[var(--featured)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--featured)] transition hover:bg-[var(--featured)]/20"
                  >
                    خيارات التمييز
                  </Link>
                )}
                <Link
                  href={`/listings/${listing.id}`}
                  className="rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-4 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]"
                >
                  عرض
                </Link>
                <Link
                  href={`/my-listings/${listing.id}/edit`}
                  className="rounded-full bg-[var(--brand)] px-4 py-1.5 text-xs font-semibold text-[var(--brand-contrast)] transition hover:opacity-90"
                >
                  تعديل
                </Link>
              </div>
            </article>
          ))}
          </div>
        </div>
      ) : (
        <div className="motion-section rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-[var(--shadow)]">
          <span className="text-5xl">📋</span>
          <p className="mt-4 text-base font-semibold text-[var(--text)]">لا توجد إعلانات بعد</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            ابدأ الآن بإضافة إعلانك الأول، الأمر لا يستغرق سوى دقيقة
          </p>
          <Link
            href="/submit-listing"
            className="ui-btn-primary mt-5 rounded-full px-6 py-2.5 text-sm"
          >
            + أضف إعلانك الأول
          </Link>
        </div>
      )}
    </RequireAuthGate>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-2">
      <span className="block text-[10px]">{label}</span>
      <span className="block truncate font-bold text-[var(--text)]">{value}</span>
    </span>
  );
}

function formatDashboardDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-SY", { year: "numeric", month: "short", day: "numeric" });
}
