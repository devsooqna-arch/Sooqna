"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/listings/ListingCard";
import { getListings } from "@/services/listingService";
import { getCategories } from "@/services/categoryService";
import type { Listing } from "@/types/listing";
import type { Category } from "@/types/category";

type SortKey = "newest" | "price_asc" | "price_desc";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "الأحدث أولاً",
  price_asc: "السعر: الأقل أولاً",
  price_desc: "السعر: الأعلى أولاً",
};

export function PublicListingsPage() {
  const params = useSearchParams();
  const categoryFilter = params.get("category");
  const searchFilter = params.get("search")?.toLowerCase() ?? "";

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    let mounted = true;
    void Promise.all([getListings(), getCategories()])
      .then(([items, cats]) => {
        if (!mounted) return;
        setListings(items);
        setCategories(cats);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch listings.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = listings;
    if (categoryFilter) {
      const target = categoryFilter.toLowerCase();
      result = result.filter((l) => l.categoryId.toLowerCase() === target);
    }
    if (searchFilter) {
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(searchFilter) ||
          l.description?.toLowerCase().includes(searchFilter)
      );
    }
    if (sort === "price_asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [listings, categoryFilter, searchFilter, sort]);

  if (loading) {
    return (
      <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
        <div className="h-48 animate-pulse rounded-lg bg-[var(--surface)]" />
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--surface)]" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-lg bg-[var(--surface)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
      {/* Sidebar */}
      <aside className="h-fit rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
        <h3 className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[var(--brand-contrast)]">
          التصنيف
        </h3>
        <div className="mt-3 space-y-1 text-sm">
          <Link
            href="/listings"
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition ${
              !categoryFilter
                ? "bg-[var(--accent-soft)] font-semibold text-[var(--brand)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${!categoryFilter ? "bg-[var(--brand)]" : "border border-[var(--chip-border)]"}`} />
            كل التصنيفات
          </Link>
          {categories.map((cat) => {
            const slug = cat.slug || cat.id;
            const isActive = categoryFilter === slug;
            return (
              <Link
                key={cat.id}
                href={`/listings?category=${encodeURIComponent(slug)}`}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition ${
                  isActive
                    ? "bg-[var(--accent-soft)] font-semibold text-[var(--brand)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-[var(--brand)]" : "border border-[var(--chip-border)]"}`} />
                {cat.name.ar || cat.name.en || cat.slug}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Listings area */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {(categoryFilter || searchFilter) ? (
              <p className="text-sm text-[var(--text-muted)]">
                {categoryFilter && (
                  <>فلتر التصنيف: <span className="font-semibold text-[var(--text)]">{categoryFilter}</span></>
                )}
                {categoryFilter && searchFilter && " • "}
                {searchFilter && (
                  <>بحث: <span className="font-semibold text-[var(--text)]">{searchFilter}</span></>
                )}
              </p>
            ) : null}
            <p className="text-xs text-[var(--text-muted)]">
              {filtered.length} إعلان
            </p>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-[var(--border)] bg-[var(--input-bg)] px-4 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--brand)]"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {filtered.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
            <p className="text-sm text-[var(--text-muted)]">لا توجد إعلانات مطابقة حاليًا.</p>
            <Link
              href="/listings"
              className="mt-3 inline-block rounded-full bg-[var(--brand)] px-5 py-2 text-xs font-semibold text-[var(--brand-contrast)]"
            >
              عرض كل الإعلانات
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
