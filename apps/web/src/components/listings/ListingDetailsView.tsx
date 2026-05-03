"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getListingById } from "@/services/listingService";
import { getCategories } from "@/services/categoryService";
import type { Listing, ListingImage } from "@/types/listing";
import type { Category } from "@/types/category";
import { useAuth } from "@/hooks/useAuth";
import { addToFavorites, removeFromFavorites, isFavorite } from "@/services/favoriteService";
import { createConversation } from "@/services/messageService";
import { trackEngagementEvent } from "@/services/engagementService";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

const LISTING_IMG_PLACEHOLDER = "/images/placeholder-listing.png";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-JO", { year: "numeric", month: "long", day: "numeric" });
}

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
  const [activeImg, setActiveImg] = useState(0);
  const showLoadingUi = useDelayedLoading(loading);

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
    return () => { mounted = false; };
  }, [listingId]);

  useEffect(() => {
    if (!currentUser) { setFavorite(false); return; }
    let mounted = true;
    void isFavorite(currentUser.uid, listingId)
      .then((flag) => { if (mounted) setFavorite(flag); })
      .catch(() => { if (mounted) setFavorite(false); });
    return () => { mounted = false; };
  }, [currentUser, listingId]);

  const sortedImages = useMemo(() => {
    if (!listing) return [] as ListingImage[];
    return [...listing.images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.order - b.order;
    });
  }, [listing]);

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
    const primaryImg = listing.images.find((img) => img.isPrimary) ?? listing.images[0];
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
          primaryImageURL: primaryImg?.url ?? "",
        },
        createdBy: currentUser.uid,
      });
      void trackEngagementEvent("contact_intent", {
        listingId: listing.id,
        conversationId: result.conversationId,
      });
      router.push(`/messages?conversation=${encodeURIComponent(result.conversationId)}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create conversation.");
    }
  }

  /* ── Loading ── */
  if (showLoadingUi) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="h-[400px] animate-pulse rounded-xl bg-[var(--surface)]" />
          <div className="h-32 animate-pulse rounded-xl bg-[var(--surface)]" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-[var(--surface)]" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }

  if (!listing) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-20 text-center shadow-[var(--shadow-sm)]">
        <p className="mb-4 text-6xl leading-none" aria-hidden>
          🔍
        </p>
        <h2 className="text-xl font-extrabold text-[var(--text)] sm:text-2xl">الإعلان غير موجود أو تم حذفه</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-muted)]">
          تعذّر تحميل هذا الإعلان. قد يكون الرابط غير صحيح أو الإعلان لم يعد متاحاً.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/listings"
            className="inline-flex rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-contrast)] shadow transition hover:opacity-90"
          >
            تصفّح إعلانات مشابهة
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--chip)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]"
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const categoryName =
    categories.find((c) => c.id === listing.categoryId || c.slug === listing.categoryId)?.name.ar
    ?? listing.categoryId;

  const priceDisplay =
    listing.priceType === "contact"
      ? "تواصل معنا"
      : listing.priceType === "negotiable"
      ? `${listing.price} ${listing.currency} (قابل للتفاوض)`
      : `${listing.price} ${listing.currency}`;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--brand)]">الرئيسية</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-[var(--brand)]">الإعلانات</Link>
        <span>/</span>
        <span className="text-[var(--text)]">{listing.title}</span>
      </nav>

      <article className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* ── Main column ── */}
        <div className="space-y-4">

          {/* Image Gallery */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
            <div className="relative h-[360px] w-full sm:h-[460px]">
              <ListingHeroImage sortedImages={sortedImages} activeImg={activeImg} alt={listing.title} />
              {listing.isFeatured && (
                <span className="absolute right-3 top-3 rounded-full bg-[var(--featured)] px-3 py-1 text-xs font-bold text-[var(--featured-text)] shadow">
                  مميز ★
                </span>
              )}
              {/* Favorite heart */}
              <button
                type="button"
                onClick={() => void toggleFavorite()}
                disabled={favoriteLoading}
                aria-label="أضف للمفضلة"
                className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={favorite ? "text-red-500" : "text-gray-400"}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {sortedImages.map((img, idx) => (
                  <button
                    key={img.path || idx}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                      idx === activeImg ? "border-[var(--brand)]" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--chip)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {categoryName}
              </span>
              <span className="rounded-full border border-[var(--chip-border)] bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {listing.condition === "new" ? "جديد" : "مستعمل"}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold leading-snug text-[var(--text)] sm:text-3xl">
              {listing.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--brand)]">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {listing.location.city || "حلب"}
                {listing.location.area ? ` - ${listing.location.area}` : ""}
              </span>
              <span>نشر في {formatDate(listing.publishedAt ?? listing.createdAt)}</span>
              <span>{listing.viewsCount} مشاهدة</span>
            </div>

            {/* Price */}
            <div className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3">
              <p className="text-xs text-[var(--text-muted)]">السعر</p>
              <p className="text-2xl font-extrabold text-[var(--brand)]">{priceDisplay}</p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
            <h2 className="mb-3 text-sm font-bold text-[var(--text)]">تفاصيل الإعلان</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-muted)]">
              {listing.description || "لا يوجد وصف متاح لهذا الإعلان."}
            </p>
          </div>

          {actionError && (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
              {actionError}
            </p>
          )}

          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            العودة إلى الإعلانات
          </Link>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-4">
          {/* Seller card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">البائع</h3>
            <div className="flex items-center gap-3">
              {listing.ownerSnapshot.photoURL ? (
                <Image
                  src={listing.ownerSnapshot.photoURL}
                  alt={listing.ownerSnapshot.fullName}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xl">
                  👤
                </div>
              )}
              <div>
                <p className="font-bold text-[var(--text)]">
                  {listing.ownerSnapshot.fullName || "مستخدم سوقنا"}
                </p>
                <p className="text-xs text-[var(--text-muted)]">عضو نشط</p>
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
            <button
              type="button"
              onClick={() => void startConversation()}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-[var(--brand-contrast)] shadow transition hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              راسل البائع
            </button>

            {listing.contactPhone?.trim() ? (
              <a
                href={`https://wa.me/${listing.contactPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
              >
                <span aria-hidden>💬</span>
                تواصل عبر واتساب
              </a>
            ) : listing.contactPreference === "phone" ? (
              <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
                يفضّل البائع التواصل الصوتي — ابدأ بمحادثة داخل المنصة ثم نسّق الطريقة المناسبة.
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void toggleFavorite()}
              disabled={favoriteLoading}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                favorite
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-[var(--chip-border)] bg-[var(--chip)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={favorite ? "text-red-500" : ""}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {favoriteLoading ? "..." : favorite ? "إزالة من المفضلة" : "أضف للمفضلة"}
            </button>

            <div className="mt-3 space-y-1 border-t border-[var(--border)] pt-3">
              {reviewMsg ? (
                <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-center text-xs text-[var(--text-muted)]">{reviewMsg}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => setReviewMsg("ميزة التقييم قريباً!")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"/></svg>
                  اكتب تقييماً للبائع
                </button>
              )}
              {reportMsg ? (
                <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-center text-xs text-[var(--text-muted)]">{reportMsg}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => setReportMsg("تم استلام بلاغك، شكراً.")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  الإبلاغ عن الإعلان
                </button>
              )}
            </div>
          </div>

          {/* Listing meta */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">معلومات الإعلان</h3>
            <dl className="space-y-2 text-xs">
              <MetaRow label="التصنيف" value={categoryName} />
              <MetaRow label="الحالة" value={listing.condition === "new" ? "جديد" : "مستعمل"} />
              <MetaRow label="المدينة" value={listing.location.city || "—"} />
              <MetaRow label="المشاهدات" value={String(listing.viewsCount)} />
              <MetaRow label="تاريخ النشر" value={formatDate(listing.publishedAt ?? listing.createdAt)} />
            </dl>
          </div>
        </aside>
      </article>
    </div>
  );
}

function ListingHeroImage({
  sortedImages,
  activeImg,
  alt,
}: {
  sortedImages: ListingImage[];
  activeImg: number;
  alt: string;
}) {
  const currentImage = sortedImages[activeImg];
  const preferred =
    currentImage?.url?.trim() ? currentImage.url : LISTING_IMG_PLACEHOLDER;
  const [src, setSrc] = useState(preferred);

  useEffect(() => {
    setSrc(preferred);
  }, [preferred]);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      unoptimized
      priority
      onError={() => setSrc(LISTING_IMG_PLACEHOLDER)}
    />
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="font-semibold text-[var(--text)]">{value}</dd>
    </div>
  );
}
