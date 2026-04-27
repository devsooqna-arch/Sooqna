import type { Listing } from "@/types/listing";
import Image from "next/image";
import Link from "next/link";

export function ListingCard({ listing }: { listing: Listing }) {
  const firstImage = listing.images.find((img) => img.isPrimary) ?? listing.images[0];
  const detailsHref = `/listings/${encodeURIComponent(listing.id)}`;

  return (
    <article className="group relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] transition-shadow hover:shadow-[var(--shadow-md)]">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-[var(--surface-muted)]">
        {firstImage?.url ? (
          <Image
            src={firstImage.url}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)] opacity-40">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
            </svg>
          </div>
        )}

        {/* Featured badge */}
        {listing.isFeatured && (
          <span className="absolute right-2 top-2 z-20 rounded-full bg-[var(--featured)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--featured-text)] shadow">
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
        <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[var(--brand)]">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {listing.location.city || "الأردن"}
        </p>
      </div>

      <Link
        href={detailsHref}
        aria-label={`عرض تفاصيل الإعلان: ${listing.title}`}
        className="absolute inset-0 z-10"
      />
    </article>
  );
}
