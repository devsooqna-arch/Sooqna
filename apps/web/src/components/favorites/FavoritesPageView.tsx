"use client";

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
        const listingPromises = listingIds.map((id) =>
          getListingById(id).catch(() => null)
        );
        const listings = (await Promise.all(listingPromises)).filter(
          (item): item is Listing => Boolean(item)
        );
        if (!mounted) return;
        setItems(listings);
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
        <p className="text-sm text-[var(--text-muted)]">جاري تحميل المفضلة...</p>
      ) : error ? (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      ) : items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          لا توجد إعلانات في المفضلة بعد.
        </p>
      )}
    </RequireAuthGate>
  );
}
