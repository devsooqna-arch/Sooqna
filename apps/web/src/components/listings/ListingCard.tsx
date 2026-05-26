"use client";

import type { Listing } from "@/types/listing";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatListedAgo } from "@/lib/formatListedAgo";
import { resolvePublicMediaUrl } from "@/lib/mediaUrl";
import { arabicCity, arabicArea } from "@/lib/locationNames";
import { getMotionStaggerStyle } from "@/lib/motion";
import { useAuth } from "@/hooks/useAuth";
import { addToFavorites, removeFromFavorites, getUserFavoriteListingIds } from "@/services/favoriteService";

const PLACEHOLDER = "/images/placeholder-listing.png";

export function ListingCard({
  listing,
  featured = false,
  motionIndex = 0,
  onFavoriteToggle,
}: {
  listing: Listing;
  featured?: boolean;
  motionIndex?: number;
  onFavoriteToggle?: (listingId: string, isFav: boolean) => void;
}) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const firstImage = listing.images.find((img) => img.isPrimary) ?? listing.images[0];
  const preferredSrc = firstImage?.url?.trim()
    ? (resolvePublicMediaUrl(firstImage.url) ?? firstImage.url)
    : PLACEHOLDER;
  const [imgSrc, setImgSrc] = useState(preferredSrc);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    setImgSrc(preferredSrc);
  }, [listing.id, preferredSrc]);

  useEffect(() => {
    if (!currentUser) { setIsFav(false); return; }
    let mounted = true;
    void getUserFavoriteListingIds(currentUser.uid)
      .then((ids) => { if (mounted) setIsFav(ids.includes(listing.id)); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [currentUser, listing.id]);

  const detailsHref = `/listings/${encodeURIComponent(listing.id)}`;
  const listedAgo = formatListedAgo(listing.publishedAt ?? listing.createdAt);
  const imageCount = listing.imageCount ?? listing.images.length;
  const area = listing.location.area ? arabicArea(listing.location.area) : "";

  async function handleFavoriteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await removeFromFavorites(currentUser.uid, listing.id);
      } else {
        await addToFavorites(currentUser.uid, listing.id);
      }
      const newIsFav = !isFav;
      setIsFav(newIsFav);
      onFavoriteToggle?.(listing.id, newIsFav);
    } catch {
      // silent
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <article className="ui-card ui-card-hover motion-card group relative overflow-hidden" style={getMotionStaggerStyle(motionIndex)}>
      {/* Image */}
      <div className={`relative w-full overflow-hidden bg-[var(--surface-muted)] ${featured ? "h-44 sm:h-52" : "h-28 sm:h-44"}`}>
        <Image
          src={imgSrc}
          alt={listing.title}
          fill
          className="motion-image-hover object-cover"
          loading="lazy"
          unoptimized
          onError={() => setImgSrc(PLACEHOLDER)}
        />

        {/* Featured badge */}
        {listing.isFeatured && (
          <span className="absolute right-2 top-2 z-20 rounded-full bg-[var(--featured)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--featured-text)] shadow-[var(--shadow-sm)]">
            مميز ★
          </span>
        )}

        {/* Image count badge */}
        {imageCount > 1 && (
          <span className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            {imageCount}
          </span>
        )}

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          className="absolute left-2 bottom-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
        >
          {isFav ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </button>

        {/* Price gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-3 pb-2 pt-6">
          <span className="text-xs font-bold text-white drop-shadow sm:text-sm">
            {listing.priceType === "contact"
              ? "تواصل معنا"
              : listing.priceType === "negotiable"
              ? `${listing.price.toLocaleString()} ${listing.currency} (قابل للتفاوض)`
              : `${listing.price.toLocaleString()} ${listing.currency}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 pb-3 sm:p-3 sm:pb-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--text)]">
          {listing.title}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[var(--brand)]">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {arabicCity(listing.location.city)}{area ? ` - ${area}` : ""}
          </span>
          {listedAgo ? (
            <>
              <span className="text-[var(--border)]">•</span>
              <span>{listedAgo}</span>
            </>
          ) : null}
          {listing.viewsCount > 0 && (
            <>
              <span className="text-[var(--border)]">•</span>
              <span className="inline-flex items-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 opacity-60">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                {listing.viewsCount}
              </span>
            </>
          )}
        </p>
      </div>

      <Link
        href={detailsHref}
        aria-label={`عرض تفاصيل الإعلان: ${listing.title}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/50"
      />
    </article>
  );
}
