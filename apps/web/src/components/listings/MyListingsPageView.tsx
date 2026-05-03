"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getMyListings } from "@/services/listingService";
import type { Listing, ListingStatus } from "@/types/listing";

const STATUS_LABELS: Record<ListingStatus, string> = {
  draft:     "مسودة",
  pending:   "قيد المراجعة",
  published: "منشور",
  rejected:  "مرفوض",
  sold:      "مباع",
  archived:  "مؤرشف",
};

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
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : "Failed to load listings."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [currentUser]);

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل تحميل إعلاناتك...">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--surface)]" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-[var(--danger)]">{error}</p>
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
            <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              لا توجد إعلانات في هذا التبويب.
            </p>
          ) : null}

          <div className="space-y-3">
          {filteredListings.map((listing) => (
            <article
              key={listing.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] transition hover:shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text)]">{listing.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[listing.status]}`}>
                    {STATUS_LABELS[listing.status]}
                  </span>
                  {listing.isFeatured && (
                    <span className="rounded-full bg-[var(--featured)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--featured-text)]">
                      مميز
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {listing.price} {listing.currency}
                  {listing.location.city ? ` • ${listing.location.city}` : ""}
                  <span className="mx-1">•</span>
                  {listing.viewsCount} مشاهدة
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
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
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-[var(--shadow)]">
          <span className="text-5xl">📋</span>
          <p className="mt-4 text-base font-semibold text-[var(--text)]">لا توجد إعلانات بعد</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            ابدأ الآن بإضافة إعلانك الأول، الأمر لا يستغرق سوى دقيقة
          </p>
          <Link
            href="/submit-listing"
            className="mt-5 inline-block rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-contrast)]"
          >
            + أضف إعلانك الأول
          </Link>
        </div>
      )}
    </RequireAuthGate>
  );
}
