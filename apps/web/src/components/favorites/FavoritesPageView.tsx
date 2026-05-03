"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getUserFavoriteListingIds } from "@/services/favoriteService";
import { getListingById } from "@/services/listingService";
import type { Listing } from "@/types/listing";
import { ListingCard } from "@/components/listings/ListingCard";

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
  const [items, setItems] = useState<Listing[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");

  const sortedItems = useMemo(() => sortListings(items, sort), [items, sort]);

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    void getUserFavoriteListingIds(currentUser.uid)
      .then(async (listingIds) => {
        const results = (
          await Promise.all(listingIds.map((id) => getListingById(id).catch(() => null)))
        ).filter((item): item is Listing => Boolean(item));
        if (!mounted) return;
        setItems(results);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch favorites.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل تحميل المفضلة...">
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-lg bg-[var(--surface)]" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      ) : items.length ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedItems.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-[var(--shadow)]">
          <span className="text-5xl">❤️</span>
          <p className="mt-4 text-base font-semibold text-[var(--text)]">قائمة المفضلة فارغة</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            تصفح الإعلانات واحفظ ما يعجبك للرجوع إليه لاحقاً
          </p>
          <Link
            href="/listings"
            className="mt-5 inline-block rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-contrast)]"
          >
            تصفح الإعلانات
          </Link>
        </div>
      )}
    </RequireAuthGate>
  );
}
