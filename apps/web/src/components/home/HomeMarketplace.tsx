"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCategories } from "@/services/categoryService";
import { getListings } from "@/services/listingService";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";
import { ListingCard } from "@/components/listings/ListingCard";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

export function HomeMarketplace() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const showMarketplaceLoading = useDelayedLoading(loading);

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % 2);
    }, 7000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const featuredListings = useMemo(() => listings.slice(0, 9), [listings]);
  const topCategories = useMemo(() => categories.slice(0, 10), [categories]);
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of listings) {
      const id = l.categoryId;
      map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [listings]);
  const heroSlides = ["/hero/slide-1.png", "/hero/slide-2.png"];

  return (
    <div className="space-y-7">
      <section className="ui-card overflow-hidden">
        <div className="relative h-[235px]">
          {heroSlides.map((slideSrc, index) => {
            const isActive = index === activeHeroIndex;
            const isBeforeActive = (index + 1) % heroSlides.length === activeHeroIndex;
            const positionClass = isActive
              ? "translate-x-0 opacity-100"
              : isBeforeActive
                ? "translate-x-full opacity-0"
                : "-translate-x-full opacity-0";

            return (
              <Image
                key={slideSrc}
                src={slideSrc}
                alt={`صورة رئيسية ${index + 1}`}
                fill
                unoptimized
                className={`object-cover transition-all duration-700 ease-in-out ${positionClass}`}
                priority={index === 0}
              />
            );
          })}
          <div className="absolute inset-0 bg-black/40" aria-hidden />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white">
            <h2 className="text-xl font-bold sm:text-2xl">اكتشف أفضل الإعلانات بسهولة وأمان</h2>
            <p className="max-w-lg text-sm text-white/90">
              ابحث حسب المدينة أو التصنيف ووصل لنتيجتك بسرعة
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/listings"
                className="ui-btn-primary rounded-full px-6 text-xs"
              >
                تصفح الإعلانات
              </Link>
              <Link
                href="/submit-listing"
                className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/15 px-6 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                أضف إعلان
              </Link>
            </div>
          </div>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {heroSlides.map((slideSrc, index) => {
              const isActive = index === activeHeroIndex;
              return (
                <button
                  key={slideSrc}
                  type="button"
                  aria-label={`الانتقال إلى الشريحة ${index + 1}`}
                  onClick={() => setActiveHeroIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full border transition ${
                    isActive
                      ? "border-white bg-white"
                      : "border-white/70 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[var(--border)] border-t border-[var(--border)] bg-[var(--surface)]">
          <StatItem icon="🔍" title="بحث سريع" value="مدينة + تصنيف" />
          <StatItem icon="📢" title="نشر مجاني" value="خطوات بسيطة" />
          <StatItem icon="💬" title="تواصل مباشر" value="رسائل فورية" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[270px_1fr]">
        <aside className="ui-card p-4">
          <h3 className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[var(--brand-contrast)]">
            التصنيفات
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
            {topCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/listings?category=${encodeURIComponent(category.slug || category.id)}`}
                  className="flex items-center justify-between gap-2 rounded-md px-1 py-1.5 transition hover:bg-[var(--chip)] hover:text-[var(--text)]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full border border-[var(--chip-border)]" />
                    <span className="truncate">{category.name.ar || category.name.en || category.slug}</span>
                  </span>
                  <span className="shrink-0 text-xs text-[var(--text-muted)]">
                    {categoryCounts.get(category.id) ?? 0} إعلان
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[var(--text)]">الإعلانات</h3>
            <Link href="/listings" className="ui-btn-primary rounded-full px-4 py-1.5 text-xs">
              عرض الكل
            </Link>
          </div>

          {showMarketplaceLoading ? (
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
