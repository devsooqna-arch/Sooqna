"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getListingDetail, getListingsFiltered } from "@/services/listingService";
import { createReview } from "@/services/reviewService";
import { getCategories } from "@/services/categoryService";
import type { Listing, ListingImage } from "@/types/listing";
import type { Category } from "@/types/category";
import type { PublicSellerProfile, PublicReview } from "@/types/review";
import { ListingCard } from "@/components/listings/ListingCard";
import { useAuth } from "@/hooks/useAuth";
import { addToFavorites, removeFromFavorites, isFavorite } from "@/services/favoriteService";
import { createConversation } from "@/services/messageService";
import { trackEngagementEvent } from "@/services/engagementService";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { resolvePublicMediaUrl } from "@/lib/mediaUrl";
import { arabicCity, arabicArea } from "@/lib/locationNames";
import { addRecentlyViewedListingId } from "@/lib/recentlyViewedListings";

const LISTING_IMG_PLACEHOLDER = "/images/placeholder-listing.png";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  // Parse as UTC then format in Jordan timezone to avoid day-0 off-by-one
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  // Build a local-noon date to avoid DST/timezone edge cases
  const safeDate = new Date(year, month, day, 12, 0, 0);
  return safeDate.toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" });
}

export function ListingDetailsView({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<PublicSellerProfile | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const showLoadingUi = useDelayedLoading(loading);

  useEffect(() => {
    let mounted = true;
    void Promise.all([getListingDetail(listingId), getCategories()])
      .then(([detail, cats]) => {
        if (!mounted) return;
        if (detail) {
          setListing(detail.listing);
          setSeller(detail.seller ?? null);
          setReviews(detail.reviews ?? []);
        }
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

  useEffect(() => {
    if (!listing) return;
    addRecentlyViewedListingId(listing.id);

    let mounted = true;
    void getListingsFiltered({
      category: listing.categoryId,
      city: listing.location.city,
      limit: 7,
      sort: "newest",
    })
      .then((response) => {
        if (!mounted) return;
        setSimilarListings(
          response.listings
            .filter((item) => item.id !== listing.id && item.status === "published")
            .slice(0, 6)
        );
      })
      .catch(() => {
        if (mounted) setSimilarListings([]);
      });

    return () => {
      mounted = false;
    };
  }, [listing]);

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
    try {
      const result = await createConversation({
        listingId: listing.id,
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

  async function handleShare() {
    if (!listing) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = listing.title;
    const text = `${title} — ${listing.price} ${listing.currency}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or browser blocked — fall through to clipboard
      }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      /* ignore clipboard errors */
    }
  }

  /* ── Loading ── */
  if (showLoadingUi) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="motion-skeleton h-[400px] rounded-xl bg-[var(--surface)]" />
          <div className="motion-skeleton h-32 rounded-xl bg-[var(--surface)]" />
        </div>
        <div className="motion-skeleton h-64 rounded-xl bg-[var(--surface)]" />
      </div>
    );
  }

  if (error) {
    return <p className="motion-alert text-sm text-[var(--danger)]">{error}</p>;
  }

  if (!listing) {
    return (
      <div className="motion-section rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-20 text-center shadow-[var(--shadow-sm)]">
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
            className="ui-btn-primary rounded-full px-6 py-2.5 text-sm"
          >
            تصفّح إعلانات مشابهة
          </Link>
          <Link
            href="/"
            className="ui-btn-ghost rounded-full px-6 py-2.5 text-sm"
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
          <div className="ui-card motion-section overflow-hidden rounded-xl">
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
                className="motion-press absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition-opacity hover:opacity-95 disabled:opacity-50"
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
                    <Image
                      src={resolvePublicMediaUrl(img.url) ?? img.url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="ui-card motion-section rounded-xl p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--chip)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {categoryName}
              </span>
              <span className="rounded-full border border-[var(--chip-border)] bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {listing.condition === "new" ? "جديد" : "مستعمل"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold leading-snug text-[var(--text)] sm:text-3xl">
                {listing.title}
              </h1>
              <button
                type="button"
                onClick={() => void handleShare()}
                title="مشاركة الإعلان"
                className="motion-press mt-1 shrink-0 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {shareCopied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--brand)]">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {arabicCity(listing.location.city) || "حلب"}
                {listing.location.area ? ` - ${arabicArea(listing.location.area)}` : ""}
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
          <div className="ui-card motion-section rounded-xl p-5">
            <h2 className="mb-3 text-sm font-bold text-[var(--text)]">تفاصيل الإعلان</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-muted)]">
              {listing.description || "لا يوجد وصف متاح لهذا الإعلان."}
            </p>
          </div>

          {/* Reviews section */}
          {reviews.length > 0 && (
            <div className="ui-card motion-section rounded-xl p-5">
              <h2 className="mb-4 text-sm font-bold text-[var(--text)]">
                تقييمات المشترين
                {seller?.stats.totalReviews ? (
                  <span className="mr-2 text-xs font-normal text-[var(--text-muted)]">
                    ({seller.stats.totalReviews} تقييم)
                  </span>
                ) : null}
              </h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      {review.reviewer.photoURL ? (
                        <Image
                          src={review.reviewer.photoURL}
                          alt={review.reviewer.fullName}
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs">
                          👤
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--text)]">
                            {review.reviewer.fullName || "مستخدم"}
                          </span>
                          <StarRating rating={review.rating} size={10} />
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {actionError && (
            <p className="motion-alert rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
              {actionError}
            </p>
          )}

          {similarListings.length > 0 && (
            <div className="ui-card motion-section rounded-xl p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-[var(--text)]">إعلانات مشابهة</h2>
                <Link
                  href={`/listings?category=${encodeURIComponent(listing.categoryId)}&city=${encodeURIComponent(listing.location.city)}`}
                  className="text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  عرض المزيد
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {similarListings.map((item, index) => (
                  <ListingCard key={item.id} listing={item} motionIndex={index} />
                ))}
              </div>
            </div>
          )}

          <Link
            href="/listings"
            className="ui-btn-ghost inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs"
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
          <div className="ui-card motion-section rounded-xl p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">البائع</h3>
            <div className="flex items-center gap-3">
              {(seller?.photoURL || listing.ownerSnapshot.photoURL) ? (
                <Image
                  src={seller?.photoURL || listing.ownerSnapshot.photoURL}
                  alt={seller?.fullName || listing.ownerSnapshot.fullName}
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-bold text-[var(--text)]">
                    {seller?.fullName || listing.ownerSnapshot.fullName || "مستخدم سوقنا"}
                  </p>
                  {seller?.stats.isEmailVerified && (
                    <span title="بريد إلكتروني موثّق" className="shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                  )}
                  {seller?.stats.isIdVerified && (
                    <span title="هوية موثّقة" className="shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                      </svg>
                    </span>
                  )}
                </div>
                {seller?.stats ? (
                  <div className="mt-1 flex items-center gap-2">
                    {seller.stats.totalReviews > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <StarRating rating={seller.stats.avgRating} size={11} />
                        <span className="font-semibold text-[var(--text)]">{seller.stats.avgRating}</span>
                        <span>({seller.stats.totalReviews})</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">لا توجد تقييمات بعد</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">عضو نشط</p>
                )}
              </div>
            </div>

            {seller?.stats && (
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--text)]">{seller.stats.totalListings}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">إعلان</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--text)]">{seller.stats.totalSold}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">تم البيع</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--text)]">
                    {formatMemberSince(seller.stats.memberSince)}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">عضو منذ</p>
                </div>
              </div>
            )}

            {seller?.bio && (
              <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-5 text-[var(--text-muted)]">
                {seller.bio}
              </p>
            )}
          </div>

          {/* Actions card */}
          <div className="ui-card motion-section rounded-xl p-5">
            <button
              type="button"
              onClick={() => void startConversation()}
              className="ui-btn-primary flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm"
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
              <p className="motion-alert mt-2 text-center text-xs text-[var(--text-muted)]">
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

            {/* Share */}
            <div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
              <button
                type="button"
                onClick={() => void handleShare()}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]"
              >
                {shareCopied ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-green-600">تم نسخ الرابط!</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    مشاركة الإعلان
                  </>
                )}
              </button>

              {/* Quick share: Telegram & WhatsApp */}
              {listing && (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(listing.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                  >
                    <span aria-hidden>✈️</span> تيليغرام
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${listing.title} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-full border border-green-300 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-100"
                  >
                    <span aria-hidden>💬</span> واتساب
                  </a>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-1 border-t border-[var(--border)] pt-3">
              {reviewSuccess ? (
                <p className="motion-alert rounded-lg bg-green-50 px-3 py-2 text-center text-xs text-green-700">
                  تم إرسال تقييمك بنجاح!
                </p>
              ) : reviewOpen ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[var(--text)]">تقييم البائع</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="transition hover:scale-110"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={star <= reviewRating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={star <= reviewRating ? "text-amber-400" : "text-gray-300"}>
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="اكتب تعليقك هنا (اختياري)..."
                    rows={3}
                    maxLength={2000}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
                  />
                  {reviewError && (
                    <p className="text-xs text-red-600">{reviewError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={reviewSubmitting}
                      onClick={async () => {
                        if (!listing || !currentUser) return;
                        setReviewSubmitting(true);
                        setReviewError(null);
                        try {
                          const newReview = await createReview({
                            sellerId: listing.ownerId,
                            listingId: listing.id,
                            rating: reviewRating,
                            comment: reviewComment,
                          });
                          setReviews((prev) => [
                            {
                              ...newReview,
                              reviewer: { fullName: currentUser.displayName ?? "", photoURL: currentUser.photoURL ?? "" },
                              listingId: listing.id,
                              createdAt: newReview.createdAt ?? new Date().toISOString(),
                            },
                            ...prev,
                          ]);
                          if (seller) {
                            setSeller({
                              ...seller,
                              stats: {
                                ...seller.stats,
                                totalReviews: seller.stats.totalReviews + 1,
                              },
                            });
                          }
                          setReviewSuccess(true);
                          setReviewOpen(false);
                        } catch (err) {
                          setReviewError(err instanceof Error ? err.message : "فشل إرسال التقييم.");
                        } finally {
                          setReviewSubmitting(false);
                        }
                      }}
                      className="ui-btn-primary flex-1 rounded-full px-3 py-2 text-xs disabled:opacity-50"
                    >
                      {reviewSubmitting ? "..." : "إرسال التقييم"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReviewOpen(false); setReviewError(null); }}
                      className="rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-3 py-2 text-xs text-[var(--text-muted)]"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
                      return;
                    }
                    setReviewOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"/></svg>
                  اكتب تقييماً للبائع
                </button>
              )}
              {reportMsg ? (
                <p className="motion-alert rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-center text-xs text-[var(--text-muted)]">{reportMsg}</p>
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
          <div className="ui-card motion-section rounded-xl p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">معلومات الإعلان</h3>
            <dl className="space-y-2 text-xs">
              <MetaRow label="التصنيف" value={categoryName} />
              <MetaRow label="الحالة" value={listing.condition === "new" ? "جديد" : "مستعمل"} />
              <MetaRow label="المدينة" value={arabicCity(listing.location.city) || "—"} />
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
    currentImage?.url?.trim()
      ? (resolvePublicMediaUrl(currentImage.url) ?? currentImage.url)
      : LISTING_IMG_PLACEHOLDER;
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

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : half ? "url(#halfStar)" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={filled || half ? "text-amber-400" : "text-gray-300"}
          >
            {half && (
              <defs>
                <linearGradient id="halfStar">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"/>
          </svg>
        );
      })}
    </span>
  );
}

function formatMemberSince(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} يوم`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} شهر`;
  const years = Math.floor(months / 12);
  return `${years} سنة`;
}
