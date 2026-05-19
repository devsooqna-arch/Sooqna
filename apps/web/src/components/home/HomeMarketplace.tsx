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
import { CategoryIcon } from "@/lib/categoryIcons";
import { SUBCATEGORIES } from "@/lib/categorySubcategories";

export function HomeMarketplace() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
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

  const featuredListings = useMemo(() => listings.filter((l) => l.isFeatured), [listings]);
  const regularListings = useMemo(() => listings.filter((l) => !l.isFeatured), [listings]);
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
    <div className="w-full space-y-7">
      <section className="ui-card motion-section overflow-hidden -mx-4 rounded-none sm:mx-0 sm:rounded-2xl">
        <div className="relative h-[175px] sm:h-[235px]">
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
                className={`object-cover transition-[opacity,transform] duration-[var(--motion-page)] ease-[var(--ease-standard)] ${positionClass}`}
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
                className="motion-press inline-flex items-center justify-center rounded-full border border-white/70 bg-white/15 px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
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
        <aside className="ui-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <Link href="/listings" className="text-xs text-[var(--brand)] hover:underline">عرض الكل</Link>
            <h3 className="text-sm font-bold text-[var(--text)]">التصنيفات</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {topCategories.map((category) => {
              const slug = category.slug || category.id;
              const count = categoryCounts.get(category.id) ?? 0;
              const isExpanded = expandedSlug === slug;
              const subs = SUBCATEGORIES[slug] ?? [];
              return (
                <div key={category.id} className="divide-y divide-[var(--border)]">
                  <div className={`flex items-center justify-between px-4 py-3 transition ${isExpanded ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--accent-soft)]"}`}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedSlug(isExpanded ? null : slug)}
                        className="motion-press flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-lg font-bold leading-none text-[var(--brand-contrast)] transition-opacity hover:opacity-80"
                      >
                        {isExpanded ? "×" : "+"}
                      </button>
                      {count > 0 && <span className="text-xs text-[var(--text-muted)]">{count}</span>}
                    </div>
                    <Link
                      href={`/listings?category=${encodeURIComponent(slug)}`}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm font-semibold text-[var(--text)]">{category.name.ar || category.name.en}</span>
                      <CategoryIcon slug={slug} className="text-[var(--brand)]" />
                    </Link>
                  </div>
                  {isExpanded && subs.length > 0 && (
                    <div className="motion-dropdown bg-[var(--surface-muted,var(--surface))]" data-motion-state="enter">
                      {subs.map((sub) => (
                        <Link
                          key={sub}
                          href={`/listings?category=${encodeURIComponent(slug)}`}
                          className="block py-2.5 pr-8 pl-4 text-right text-sm text-[var(--text-muted)] transition hover:text-[var(--text)]"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          {showMarketplaceLoading ? (
            <div className="space-y-3">
              <div className="motion-skeleton h-6 w-40 rounded-md bg-[var(--surface)]" />
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="motion-skeleton h-52 rounded-lg bg-[var(--surface)]" />
                ))}
              </div>
            </div>
          ) : error ? (
            <p className="motion-alert text-sm text-[var(--danger)]">{error}</p>
          ) : (
            <>
              {featuredListings.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--text)]">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--featured)] text-sm text-[var(--featured-text)]">★</span>
                      الإعلانات المميزة
                    </h3>
                    <Link href="/listings?featured=true" className="text-xs text-[var(--brand)] hover:underline">
                      عرض الكل
                    </Link>
                  </div>
                  <div className="w-full rounded-2xl border border-[var(--featured)]/30 bg-[var(--featured)]/5 p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {featuredListings.map((listing, index) => (
                        <ListingCard key={listing.id} listing={listing} featured motionIndex={index} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[var(--text)]">آخر الإعلانات</h3>
                  <Link href="/listings" className="ui-btn-primary rounded-full px-4 py-1.5 text-xs">
                    عرض الكل
                  </Link>
                </div>
                {regularListings.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">لا توجد إعلانات حالياً.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {regularListings.map((listing, index) => (
                      <ListingCard key={listing.id} listing={listing} motionIndex={index} />
                    ))}
                  </div>
                )}
              </div>
            </>
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
