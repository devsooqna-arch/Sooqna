"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getUserFavoriteListingIds } from "@/services/favoriteService";
import { getListingsByIds } from "@/services/listingService";
import type { Listing } from "@/types/listing";
import { ListingCard } from "@/components/listings/ListingCard";
import { isEmailNotVerified } from "@/lib/apiError";
import { EmailVerificationBanner } from "@/components/ui/EmailVerificationBanner";

type SortKey = "newest" | "price_asc" | "price_desc";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "الأحدث أولاً",
  price_asc: "السعر: الأقل أولاً",
  price_desc: "السعر: الأعلى أولاً",
};

function sortListings(items: Listing[], sort: SortKey): Listing[] {
  const copy = [...items];
  if (sort === "price_asc") {
    copy.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    copy.sort((a, b) => b.price - a.price);
  } else {
    copy.sort((a, b) => {
      const ta = new Date(a.publishedAt ?? a.createdAt ?? 0).getTime();
      const tb = new Date(b.publishedAt ?? b.createdAt ?? 0).getTime();
      return tb - ta;
    });
  }
  return copy;
}

export function FavoritesPageView() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailUnverified, setEmailUnverified] = useState(false);
  const [items, setItems] = useState<Listing[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const sortedItems = useMemo(() => sortListings(items, sort), [items, sort]);

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    void getUserFavoriteListingIds(currentUser.uid)
      .then(async (listingIds) => {
        if (!mounted || !listingIds.length) {
          if (mounted) setItems([]);
          return;
        }
        const results = await getListingsByIds(listingIds);
        if (!mounted) return;
        setItems(results);
      })
      .catch((err) => {
        if (!mounted) return;
        if (isEmailNotVerified(err)) { setEmailUnverified(true); }
        else { setError(err instanceof Error ? err.message : "حدث خطأ أثناء تحميل المفضلة."); }
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const handleFavoriteToggle = useCallback((listingId: string, isFav: boolean) => {
    if (isFav) return;
    setRemovingIds((prev) => new Set(prev).add(listingId));
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== listingId));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }, 300);
  }, []);

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل تحميل المفضلة...">
      {emailUnverified && <EmailVerificationBanner />}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="motion-skeleton h-52 rounded-lg bg-[var(--surface)]" />
          ))}
        </div>
      ) : error ? (
        <p className="motion-alert text-sm text-[var(--danger)]">{error}</p>
      ) : items.length ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
              {items.length} إعلان محفوظ
            </span>
            <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>ترتيب:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="ui-pill-input ui-select h-9 rounded-full border-[var(--border)] py-1.5 text-xs"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {sortedItems.map((item, index) => (
              <div
                key={item.id}
                className={`transition-all duration-300 ${
                  removingIds.has(item.id) ? "scale-95 opacity-0" : "scale-100 opacity-100"
                }`}
              >
                <ListingCard
                  listing={item}
                  motionIndex={index}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="motion-section rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-[var(--shadow)]">
          <span className="text-5xl">❤️</span>
          <p className="mt-4 text-base font-semibold text-[var(--text)]">قائمة المفضلة فارغة</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            تصفح الإعلانات واحفظ ما يعجبك للرجوع إليه لاحقاً
          </p>
          <Link
            href="/listings"
            className="ui-btn-primary mt-5 rounded-full px-6 py-2.5 text-sm"
          >
            تصفح الإعلانات
          </Link>
        </div>
      )}
    </RequireAuthGate>
  );
}
