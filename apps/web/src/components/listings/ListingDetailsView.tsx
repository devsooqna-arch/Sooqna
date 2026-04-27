"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getListingById } from "@/services/listingService";
import { getCategories } from "@/services/categoryService";
import type { Listing } from "@/types/listing";
import type { Category } from "@/types/category";
import { useAuth } from "@/hooks/useAuth";
import { addToFavorites, removeFromFavorites, isFavorite } from "@/services/favoriteService";
import { createConversation } from "@/services/messageService";

export function ListingDetailsView({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [reportMsg, setReportMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([getListingById(listingId), getCategories()])
      .then(([item, cats]) => {
        if (!mounted) return;
        setListing(item);
        setCategories(cats);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch listing.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [listingId]);

  useEffect(() => {
    if (!currentUser) {
      setFavorite(false);
      return;
    }
    let mounted = true;
    void isFavorite(currentUser.uid, listingId)
      .then((flag) => {
        if (!mounted) return;
        setFavorite(flag);
      })
      .catch(() => {
        if (!mounted) return;
        setFavorite(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentUser, listingId]);

  async function toggleFavorite() {
    if (!listing) return;
    if (!currentUser) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
      return;
    }
    setFavoriteLoading(true);
    setActionError(null);
    try {
      if (favorite) {
        await removeFromFavorites(currentUser.uid, listing.id);
        setFavorite(false);
      } else {
        await addToFavorites(currentUser.uid, listing.id);
        setFavorite(true);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update favorites.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function startConversation() {
    if (!listing) return;
    if (!currentUser) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
      return;
    }
    setActionError(null);
    try {
      const result = await createConversation({
        participantIds: [currentUser.uid, listing.ownerId],
        participants: {
          [currentUser.uid]: {
            fullName: currentUser.displayName ?? "",
            photoURL: currentUser.photoURL ?? "",
          },
          [listing.ownerId]: {
            fullName: listing.ownerSnapshot.fullName ?? "",
            photoURL: listing.ownerSnapshot.photoURL ?? "",
          },
        },
        listingId: listing.id,
        listingSnapshot: {
          title: listing.title,
          primaryImageURL: primaryImage?.url ?? "",
        },
        createdBy: currentUser.uid,
      });
      router.push(`/messages?conversation=${encodeURIComponent(result.conversationId)}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create conversation.");
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">جاري تحميل تفاصيل الإعلان...</p>;
  }

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }

  if (!listing) {
    return (
      <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
        الإعلان غير موجود أو غير متاح.
      </p>
    );
  }

  const primaryImage = listing.images.find((img) => img.isPrimary) ?? listing.images[0];
  const categoryName =
    categories.find((c) => c.id === listing.categoryId || c.slug === listing.categoryId)?.name.ar
    ?? listing.categoryId;

  return (
    <article className="grid gap-6 lg:grid-cols-[270px_1fr]">
      <aside className="space-y-4">
        {actionError ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
            {actionError}
          </p>
        ) : null}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <button
            type="button"
            onClick={() => void startConversation()}
            className="w-full rounded-full bg-[var(--brand)] px-3 py-2.5 text-sm font-semibold text-[var(--brand-contrast)]"
          >
            التواصل مع البائع
          </button>
          <div className="mt-4 space-y-2 text-center text-sm text-[var(--text-muted)]">
            {reviewMsg ? (
              <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-1.5 text-xs">{reviewMsg}</p>
            ) : (
              <button className="block w-full" onClick={() => setReviewMsg("ميزة التقييم قريباً!")}>
                اكتب تقييمًا
              </button>
            )}
            {reportMsg ? (
              <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-1.5 text-xs">{reportMsg}</p>
            ) : (
              <button className="block w-full" onClick={() => setReportMsg("تم استلام بلاغك، شكراً.")}>
                الإبلاغ عن الإعلان
              </button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)]">
            👤
          </div>
          <p className="text-2xl font-bold text-[var(--text)]">
            {listing.ownerSnapshot.fullName || listing.ownerId}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">عضو منذ 2026.3.17</p>
          <button
            type="button"
            onClick={() => void toggleFavorite()}
            disabled={favoriteLoading}
            className="mt-3 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-4 py-1.5 text-xs text-[var(--text-muted)]"
          >
            {favoriteLoading ? "..." : favorite ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
          </button>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <p className="mb-2 inline-flex rounded-full bg-[var(--chip)] px-3 py-1 text-xs text-[var(--text-muted)]">
            {categoryName}
          </p>
          <h2 className="text-5xl font-extrabold leading-tight text-[var(--text)]">
            {listing.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">عمان، الأردن • نشر في 2026.7.17</p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-[var(--brand)]">التفاصيل</div>
          {primaryImage?.url ? (
            <Image
              src={primaryImage.url}
              alt={listing.title}
              width={1200}
              height={700}
              className="h-[420px] w-full rounded-md object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-md bg-[var(--surface-muted)] text-sm text-[var(--text-muted)]">
              لا توجد صورة للإعلان
            </div>
          )}
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            {listing.description || "لا يوجد وصف متاح لهذا الإعلان."}
          </p>
          <p className="mt-4 text-sm font-semibold text-[var(--brand)]">
            {listing.price} {listing.currency}
          </p>
        </div>

        <Link
          href="/listings"
          className="inline-flex rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]"
        >
          العودة إلى الإعلانات
        </Link>
      </section>
    </article>
  );
}
