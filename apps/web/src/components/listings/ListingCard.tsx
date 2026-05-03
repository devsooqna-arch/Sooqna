"use client";

import type { Listing } from "@/types/listing";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatListedAgo } from "@/lib/formatListedAgo";

const PLACEHOLDER = "/images/placeholder-listing.svg";

export function ListingCard({ listing }: { listing: Listing }) {
  const firstImage = listing.images.find((img) => img.isPrimary) ?? listing.images[0];
  const preferredSrc = firstImage?.url?.trim() ? firstImage.url : PLACEHOLDER;
  const [imgSrc, setImgSrc] = useState(preferredSrc);

  useEffect(() => {
    setImgSrc(preferredSrc);
  }, [listing.id, preferredSrc]);
  const detailsHref = `/listings/${encodeURIComponent(listing.id)}`;
  const listedAgo = formatListedAgo(listing.publishedAt ?? listing.createdAt);

  return (
    <article className="ui-card ui-card-hover group relative overflow-hidden">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-[var(--surface-muted)]">
        <Image
          src={imgSrc}
          alt={listing.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
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

        {/* Price gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-3 pb-2 pt-6">
          <span className="text-sm font-bold text-white drop-shadow">
            {listing.priceType === "contact"
              ? "تواصل معنا"
              : listing.priceType === "negotiable"
              ? `${listing.price} ${listing.currency} (قابل للتفاوض)`
              : `${listing.price} ${listing.currency}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 pb-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--text)]">
          {listing.title}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[var(--brand)]">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {listing.location.city || "الأردن"}
          </span>
          {listedAgo ? (
            <>
              <span className="text-[var(--border)]">•</span>
              <span>{listedAgo}</span>
            </>
          ) : null}
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
