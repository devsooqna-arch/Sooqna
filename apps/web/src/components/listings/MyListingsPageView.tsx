"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getMyListings } from "@/services/listingService";
import type { Listing } from "@/types/listing";

export function MyListingsPageView() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    void getMyListings()
      .then((items) => {
        if (!mounted) return;
        setMyListings(items);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load listings.");
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
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل تحميل إعلاناتك...">
      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">جاري تحميل الإعلانات...</p>
      ) : error ? (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      ) : myListings.length ? (
        <div className="space-y-3">
          {myListings.map((listing) => (
            <article
              key={listing.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-base font-semibold">{listing.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  الحالة: {listing.status} • السعر: {listing.price} {listing.currency}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/listings/${listing.id}`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold"
                >
                  عرض
                </Link>
                <Link
                  href={`/my-listings/${listing.id}/edit`}
                  className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-contrast)]"
                >
                  تعديل
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          لا يوجد لديك إعلانات بعد. ابدأ من صفحة إضافة إعلان.
        </p>
      )}
    </RequireAuthGate>
  );
}
