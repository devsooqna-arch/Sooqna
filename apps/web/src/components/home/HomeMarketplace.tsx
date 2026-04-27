"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const CATEGORY_ICONS: Record<string, string> = {
  cars: "🚗",
  "real-estate": "🏠",
  electronics: "📱",
  furniture: "🛋️",
  jobs: "💼",
  fashion: "👗",
  kids: "🧸",
  sports: "⚽",
  services: "🔧",
  other: "📦",
};
import { getCategories } from "@/services/categoryService";
import { getListings } from "@/services/listingService";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";
import { ListingCard } from "@/components/listings/ListingCard";

export function HomeMarketplace() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([getCategories(), getListings()])
      .then(([cats, items]) => {
        if (!mounted) return;
        setCategories(cats);
        setListings(items);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load marketplace data.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const featuredListings = useMemo(() => listings.slice(0, 9), [listings]);
  const topCategories = useMemo(() => categories.slice(0, 10), [categories]);
  const heroImage =
    featuredListings[0]?.images.find((img) => img.isPrimary)?.url || featuredListings[0]?.images[0]?.url;

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="relative h-[235px]">
          {heroImage ? (
            <Image src={heroImage} alt="Hero listing" fill className="object-cover" unoptimized priority />
          ) : null}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white">
            <h2 className="text-xl font-bold sm:text-2xl">اكتشف أفضل الإعلانات بسهولة وأمان</h2>
            <p className="max-w-lg text-sm text-white/90">
              ابحث حسب المدينة أو التصنيف ووصل لنتيجتك بسرعة
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/listings"
                className="rounded-full bg-[var(--brand)] px-6 py-2 text-xs font-semibold text-[var(--brand-contrast)]"
              >
                تصفح الإعلانات
              </Link>
              <Link
                href="/submit-listing"
                className="rounded-full border border-white/70 bg-white/15 px-6 py-2 text-xs font-semibold text-white"
              >
                أضف إعلان
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[var(--border)] border-t border-[var(--border)] bg-[var(--surface)]">
          <StatItem icon="🔍" title="بحث سريع" value="مدينة + تصنيف" />
          <StatItem icon="📢" title="نشر مجاني" value="خطوات بسيطة" />
          <StatItem icon="💬" title="تواصل مباشر" value="رسائل فورية" />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold">التصنيفات</h3>
          <Link href="/categories" className="text-xs font-semibold text-[var(--brand)]">
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-md bg-[var(--surface-muted)]" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-[var(--danger)]">{error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {topCategories.map((category) => (
              <Link
                key={category.id}
                href={`/listings?category=${encodeURIComponent(category.slug || category.id)}`}
                className="flex flex-col items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-center transition hover:border-[var(--brand)] hover:bg-[var(--accent-soft)]"
              >
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xl">
                  {CATEGORY_ICONS[category.slug] ?? CATEGORY_ICONS[category.id] ?? "📦"}
                </span>
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  {category.name.ar || category.name.en || category.slug}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[270px_1fr]">
        <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <h3 className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[var(--brand-contrast)]">
            التصنيفات
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
            {topCategories.map((category) => (
              <li key={category.id} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-[var(--chip-border)]" />
                <span>{category.name.ar || category.name.en || category.slug}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[var(--text)]">الإعلانات</h3>
            <Link href="/listings" className="rounded-full bg-[var(--brand)] px-4 py-1.5 text-xs font-semibold text-[var(--brand-contrast)]">
              عرض الكل
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-lg bg-[var(--surface)]" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-[var(--danger)]">{error}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatItem({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-3 text-center">
      <span className="text-xl">{icon}</span>
      <p className="text-[11px] font-bold text-[var(--text)] sm:text-xs">{title}</p>
      <p className="text-[10px] text-[var(--text-muted)] sm:text-[11px]">{value}</p>
    </div>
  );
}
