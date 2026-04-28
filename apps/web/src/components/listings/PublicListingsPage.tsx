"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/listings/ListingCard";
import { getListingsFiltered } from "@/services/listingService";
import { getCategories } from "@/services/categoryService";
import type { Listing } from "@/types/listing";
import type { Category } from "@/types/category";

type SortKey = "newest" | "price_asc" | "price_desc";
const PAGE_SIZE = 12;

const SORT_LABELS: Record<SortKey, string> = {
  newest: "الأحدث أولاً",
  price_asc: "السعر: الأقل أولاً",
  price_desc: "السعر: الأعلى أولاً",
};

function buildPageNumbers(currentPage: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | "..."> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("...");
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

function ListingsSkeleton() {
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

function PublicListingsPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const categoryFilter = (params.get("category") ?? "").toLowerCase();
  const cityFilterRaw = (params.get("city") ?? "").toLowerCase();
  const cityFilter = cityFilterRaw;
  const searchFilterRaw = params.get("search") ?? "";
  const searchFilter = searchFilterRaw.toLowerCase();
  const sortParam = params.get("sort");
  const sort: SortKey =
    sortParam === "newest" || sortParam === "price_asc" || sortParam === "price_desc"
      ? sortParam
      : "newest";
  const pageRaw = Number(params.get("page") ?? "1");
  const currentPage = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const buildListingsHref = useCallback((overrides?: {
    category?: string | null;
    city?: string | null;
    search?: string | null;
    sort?: SortKey | null;
    page?: number | null;
  }): string => {
    const nextParams = new URLSearchParams(params.toString());
    const entries: Array<[string, string | null | undefined]> = [
      ["category", overrides?.category],
      ["city", overrides?.city],
      ["search", overrides?.search],
      ["sort", overrides?.sort],
      ["page", overrides?.page ? String(overrides.page) : overrides?.page === null ? null : undefined],
    ];

    for (const [key, value] of entries) {
      if (value === undefined) continue;
      if (value === null || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }

    const queryString = nextParams.toString();
    return queryString ? `/listings?${queryString}` : "/listings";
  }, [params]);

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    void Promise.all([
      getListingsFiltered({
        category: categoryFilter || undefined,
        city: cityFilterRaw || undefined,
        search: searchFilterRaw || undefined,
        sort,
        limit: PAGE_SIZE,
        offset: (currentPage - 1) * PAGE_SIZE,
      }),
      getCategories(),
    ])
      .then(([result, cats]) => {
        if (!mounted) return;
        setListings(result.listings);
        setTotal(result.total);
        setCategories(cats);
        if (result.filters) {
          const normalizedUrl = buildListingsHref({
            category: result.filters.category,
            city: result.filters.city,
            search: result.filters.search,
            sort: result.filters.sort,
            page: currentPage,
          });
          const currentUrl = buildListingsHref({});
          if (normalizedUrl !== currentUrl) {
            router.replace(normalizedUrl);
          }
        }
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
  }, [categoryFilter, cityFilterRaw, searchFilterRaw, sort, currentPage, router, buildListingsHref]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startCount = total === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endCount = total === 0 ? 0 : Math.min((safeCurrentPage - 1) * PAGE_SIZE + listings.length, total);
  const pageNumbers = buildPageNumbers(safeCurrentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      router.replace(buildListingsHref({ page: totalPages }));
    }
  }, [currentPage, totalPages, router, buildListingsHref]);

  if (loading) {
    return <ListingsSkeleton />;
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
            href={buildListingsHref({
              category: null,
              city: null,
              search: null,
              sort: null,
              page: null,
            })}
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
                href={buildListingsHref({ category: slug, page: 1 })}
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
        {(categoryFilter || cityFilterRaw || searchFilterRaw) ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 transition-all duration-300 ease-out">
            {categoryFilter ? (
              <Link
                href={buildListingsHref({ category: null, page: 1 })}
                className="translate-y-0 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 opacity-100 transition-all duration-300 ease-out hover:bg-emerald-100"
              >
                🏷️ التصنيف: {categoryFilter} ×
              </Link>
            ) : null}
            {cityFilterRaw ? (
              <Link
                href={buildListingsHref({ city: null, page: 1 })}
                className="translate-y-0 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 opacity-100 transition-all duration-300 ease-out hover:bg-sky-100"
              >
                📍 المدينة: {cityFilterRaw} ×
              </Link>
            ) : null}
            {searchFilterRaw ? (
              <Link
                href={buildListingsHref({ search: null, page: 1 })}
                className="translate-y-0 rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 opacity-100 transition-all duration-300 ease-out hover:bg-violet-100"
              >
                🔎 بحث: {searchFilterRaw} ×
              </Link>
            ) : null}
            <Link
              href={buildListingsHref({
                category: null,
                city: null,
                search: null,
                sort: null,
                page: null,
              })}
              className="rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-[var(--brand-contrast)] transition hover:opacity-90"
            >
              مسح الفلاتر
            </Link>
          </div>
        ) : null}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {(categoryFilter || cityFilter || searchFilter) ? (
              <p className="text-sm text-[var(--text-muted)]">
                {categoryFilter && (
                  <>فلتر التصنيف: <span className="font-semibold text-[var(--text)]">{categoryFilter}</span></>
                )}
                {categoryFilter && (cityFilter || searchFilter) && " • "}
                {cityFilter && (
                  <>المدينة: <span className="font-semibold text-[var(--text)]">{cityFilterRaw}</span></>
                )}
                {cityFilter && searchFilter && " • "}
                {searchFilter && (
                  <>بحث: <span className="font-semibold text-[var(--text)]">{searchFilterRaw}</span></>
                )}
              </p>
            ) : null}
            <p className="text-xs text-[var(--text-muted)]">
              {total} إعلان {total > 0 ? `(${startCount}-${endCount})` : ""}
            </p>
          </div>

          <select
            value={sort}
            onChange={(e) => {
              const nextSort = e.target.value as SortKey;
              router.replace(buildListingsHref({ sort: nextSort, page: 1 }));
            }}
            className="rounded-full border border-[var(--border)] bg-[var(--input-bg)] px-4 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--brand)]"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {listings.length ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => router.replace(buildListingsHref({ page: safeCurrentPage - 1 }))}
                disabled={safeCurrentPage <= 1}
                className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                السابق
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                صفحة {safeCurrentPage} من {totalPages}
              </span>
              {pageNumbers.map((pageNum, index) =>
                pageNum === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-xs text-[var(--text-muted)]"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => router.replace(buildListingsHref({ page: pageNum }))}
                    className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs transition ${
                      pageNum === safeCurrentPage
                        ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-contrast)]"
                        : "border-[var(--border)] text-[var(--text)] hover:border-[var(--brand)]"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => router.replace(buildListingsHref({ page: safeCurrentPage + 1 }))}
                disabled={safeCurrentPage >= totalPages}
                className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                التالي
              </button>
            </div>
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

export function PublicListingsPage() {
  return (
    <Suspense fallback={<ListingsSkeleton />}>
      <PublicListingsPageInner />
    </Suspense>
  );
}
