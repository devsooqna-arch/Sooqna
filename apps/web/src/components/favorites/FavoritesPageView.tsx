"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getUserFavoriteListingIds } from "@/services/favoriteService";
import { getListingById } from "@/services/listingService";
import type { Listing } from "@/types/listing";
import { ListingCard } from "@/components/listings/ListingCard";

export function FavoritesPageView() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Listing[]>([]);

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

    return () => { mounted = false; };
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
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
