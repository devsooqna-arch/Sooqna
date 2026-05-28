"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { ListingCard } from "@/components/listings/ListingCard";
import { getListingsFiltered } from "@/services/listingService";
import { createSavedSearch } from "@/services/savedSearchService";
import { getCategories } from "@/services/categoryService";
import { useAuth } from "@/hooks/useAuth";
import type { Listing, ListingsPageResponse } from "@/types/listing";
import type { Category } from "@/types/category";
import { CategoryIcon } from "@/lib/categoryIcons";
import { SUBCATEGORIES } from "@/lib/categorySubcategories";
import { SYRIAN_GOVERNORATES } from "@/lib/locations";

type SortKey = "newest" | "price_asc" | "price_desc";
const PAGE_SIZE = 12;
const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "الأحدث أولاً" },
  { value: "price_asc", label: "السعر: الأقل أولاً" },
  { value: "price_desc", label: "السعر: الأعلى أولاً" },
];

function isValidSort(v: string | null): v is SortKey {
  return v === "newest" || v === "price_asc" || v === "price_desc";
}

function buildPageNumbers(currentPage: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: Array<number | "..."> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) pages.push("...");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export function ListingsPageSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
      <div className="motion-skeleton h-48 rounded-lg bg-[var(--surface)]" />
      <div className="space-y-4">
        <div className="motion-skeleton h-8 w-48 rounded-lg bg-[var(--surface)]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="motion-skeleton h-52 rounded-lg bg-[var(--surface)]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PublicListingsPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { currentUser } = useAuth();

  // --- Read filters from URL ---
  const categoryFilter = (params.get("category") ?? "").toLowerCase();
  const cityFilter = (params.get("city") ?? "").toLowerCase();
  const searchFilter = params.get("search") ?? "";
  const sortParam = params.get("sort");
  const sort: SortKey = isValidSort(sortParam) ? sortParam : "newest";
  const pageRaw = Number(params.get("page") ?? "1");
  const currentPage = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const priceMinRaw = Number(params.get("priceMin") ?? "");
  const priceMaxRaw = Number(params.get("priceMax") ?? "");
  const priceMin = Number.isFinite(priceMinRaw) && priceMinRaw > 0 ? priceMinRaw : undefined;
  const priceMax = Number.isFinite(priceMaxRaw) && priceMaxRaw > 0 ? priceMaxRaw : undefined;

  const hasAnyFilter = !!(categoryFilter || cityFilter || searchFilter || priceMin || priceMax);

  // --- URL builder ---
  const buildListingsHref = useCallback((overrides?: {
    category?: string | null;
    city?: string | null;
    search?: string | null;
    sort?: SortKey | null;
    page?: number | null;
    priceMin?: number | null;
    priceMax?: number | null;
  }): string => {
    const nextParams = new URLSearchParams(params.toString());
    const entries: Array<[string, string | null | undefined]> = [
      ["category", overrides?.category],
      ["city", overrides?.city],
      ["search", overrides?.search],
      ["sort", overrides?.sort],
      ["page", overrides?.page ? String(overrides.page) : overrides?.page === null ? null : undefined],
      ["priceMin", overrides?.priceMin ? String(overrides.priceMin) : overrides?.priceMin === null ? null : undefined],
      ["priceMax", overrides?.priceMax ? String(overrides.priceMax) : overrides?.priceMax === null ? null : undefined],
    ];
    for (const [key, value] of entries) {
      if (value === undefined) continue;
      if (value === null || value === "") nextParams.delete(key);
      else nextParams.set(key, value);
    }
    const queryString = nextParams.toString();
    return queryString ? `/listings?${queryString}` : "/listings";
  }, [params]);

  // --- State ---
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<Pick<ListingsPageResponse, "total" | "totalPages" | "hasNextPage" | "hasPreviousPage" | "currentPage">>({
    total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false, currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [savePanelOpen, setSavePanelOpen] = useState(false);
  const [savedSearchName, setSavedSearchName] = useState("");
  const [savingSearch, setSavingSearch] = useState(false);
  const [saveSearchMessage, setSaveSearchMessage] = useState("");
  const showSkeleton = useDelayedLoading(loading);

  // --- Price filter local state ---
  const [localPriceMin, setLocalPriceMin] = useState(priceMin?.toString() ?? "");
  const [localPriceMax, setLocalPriceMax] = useState(priceMax?.toString() ?? "");

  useEffect(() => {
    setLocalPriceMin(priceMin?.toString() ?? "");
    setLocalPriceMax(priceMax?.toString() ?? "");
  }, [priceMin, priceMax]);

  // --- Fetch ---
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    void Promise.all([
      getListingsFiltered({
        category: categoryFilter || undefined,
        city: cityFilter || undefined,
        search: searchFilter || undefined,
        sort,
        limit: PAGE_SIZE,
        offset: (currentPage - 1) * PAGE_SIZE,
        priceMin,
        priceMax,
      }),
      getCategories(),
    ])
      .then(([result, cats]) => {
        if (!mounted) return;
        setListings(result.listings);
        setPaginationMeta({
          total: result.total,
          totalPages: result.totalPages ?? Math.max(1, Math.ceil(result.total / PAGE_SIZE)),
          hasNextPage: result.hasNextPage ?? false,
          hasPreviousPage: result.hasPreviousPage ?? false,
          currentPage: result.currentPage ?? currentPage,
        });
        setCategories(cats);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "حدث خطأ أثناء تحميل الإعلانات.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [categoryFilter, cityFilter, searchFilter, sort, currentPage, priceMin, priceMax]);

  const { total, totalPages, hasNextPage, hasPreviousPage } = paginationMeta;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startCount = total === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endCount = total === 0 ? 0 : Math.min((safeCurrentPage - 1) * PAGE_SIZE + listings.length, total);
  const pageNumbers = buildPageNumbers(safeCurrentPage, totalPages);

  // Auto-redirect if page exceeds total
  useEffect(() => {
    if (!loading && currentPage > totalPages && totalPages > 0) {
      router.replace(buildListingsHref({ page: totalPages }));
    }
  }, [currentPage, totalPages, loading, router, buildListingsHref]);

  function applyPriceFilter() {
    const min = Number(localPriceMin);
    const max = Number(localPriceMax);
    router.replace(buildListingsHref({
      priceMin: Number.isFinite(min) && min > 0 ? min : null,
      priceMax: Number.isFinite(max) && max > 0 ? max : null,
      page: 1,
    }));
  }

  function clearAllFilters() {
    router.replace("/listings");
  }

  async function saveCurrentSearch() {
    if (!hasAnyFilter || !currentUser) return;
    const name = savedSearchName.trim();
    if (!name) {
      setSaveSearchMessage("اكتب اسم البحث أولاً.");
      return;
    }
    const query: Record<string, string | number> = {};
    if (categoryFilter) query.category = categoryFilter;
    if (cityFilter) query.city = cityFilter;
    if (searchFilter) query.q = searchFilter;
    if (sort) query.sort = sort;
    if (priceMin) query.priceMin = priceMin;
    if (priceMax) query.priceMax = priceMax;

    setSavingSearch(true);
    setSaveSearchMessage("");
    try {
      await createSavedSearch(name, query);
      setSaveSearchMessage("تم حفظ البحث.");
      setSavedSearchName("");
      setSavePanelOpen(false);
    } catch (err) {
      setSaveSearchMessage(err instanceof Error ? err.message : "تعذر حفظ البحث.");
    } finally {
      setSavingSearch(false);
    }
  }

  // --- Category name helper ---
  function getCategoryName(slug: string): string {
    const cat = categories.find((c) => (c.slug || c.id).toLowerCase() === slug);
    return cat?.name.ar || cat?.name.en || slug;
  }

  function getCityName(value: string): string {
    const gov = SYRIAN_GOVERNORATES.find((g) => g.value === value);
    return gov?.labelAr ?? value;
  }

  // --- Active filters chips ---
  const activeFilterChips: Array<{ key: string; label: string; color: string; onRemove: string }> = [];
  if (categoryFilter) {
    activeFilterChips.push({
      key: "category",
      label: `التصنيف: ${getCategoryName(categoryFilter)}`,
      color: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
      onRemove: buildListingsHref({ category: null, page: 1 }),
    });
  }
  if (cityFilter) {
    activeFilterChips.push({
      key: "city",
      label: `المدينة: ${getCityName(cityFilter)}`,
      color: "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100",
      onRemove: buildListingsHref({ city: null, page: 1 }),
    });
  }
  if (searchFilter) {
    activeFilterChips.push({
      key: "search",
      label: `بحث: ${searchFilter}`,
      color: "border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100",
      onRemove: buildListingsHref({ search: null, page: 1 }),
    });
  }
  if (priceMin) {
    activeFilterChips.push({
      key: "priceMin",
      label: `السعر من: ${priceMin}`,
      color: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
      onRemove: buildListingsHref({ priceMin: null, page: 1 }),
    });
  }
  if (priceMax) {
    activeFilterChips.push({
      key: "priceMax",
      label: `السعر حتى: ${priceMax}`,
      color: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
      onRemove: buildListingsHref({ priceMax: null, page: 1 }),
    });
  }

  if (showSkeleton) return <ListingsPageSkeleton />;

  // --- Sidebar content (shared between desktop and mobile) ---
  const sidebarContent = (
    <>
      {/* Categories */}
      <div className="ui-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span />
          <h3 className="text-sm font-bold text-[var(--text)]">التصنيفات</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          <Link
            href={buildListingsHref({ category: null, city: null, search: null, sort: null, page: null, priceMin: null, priceMax: null })}
            className={`flex items-center justify-between px-4 py-3 transition ${!categoryFilter ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--accent-soft)]"}`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold leading-none text-[var(--brand-contrast)] ${!categoryFilter ? "bg-red-500" : "bg-[var(--brand)]"}`}>
              {!categoryFilter ? "×" : "☰"}
            </span>
            <span className={`text-sm ${!categoryFilter ? "font-bold text-[var(--brand)]" : "font-semibold text-[var(--text)]"}`}>كل التصنيفات</span>
          </Link>
          {categories.map((cat) => {
            const slug = cat.slug || cat.id;
            const isActive = categoryFilter === slug;
            const isExpanded = expandedSlug === slug;
            const subs = SUBCATEGORIES[slug] ?? [];
            return (
              <div key={cat.id} className="divide-y divide-[var(--border)]">
                <div className={`flex items-center justify-between px-4 py-3 transition ${isActive || isExpanded ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--accent-soft)]"}`}>
                  {subs.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setExpandedSlug(isExpanded ? null : slug)}
                      aria-label={isExpanded ? `طي التصنيفات الفرعية لـ ${cat.name.ar || cat.name.en}` : `عرض التصنيفات الفرعية لـ ${cat.name.ar || cat.name.en}`}
                      aria-expanded={isExpanded}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold leading-none text-[var(--brand-contrast)] transition hover:opacity-80 ${isActive ? "bg-red-500" : "bg-[var(--brand)]"}`}
                    >
                      {isExpanded ? "−" : "+"}
                    </button>
                  ) : (
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm leading-none text-[var(--brand-contrast)] ${isActive ? "bg-red-500" : "bg-[var(--brand)]"}`}>
                      •
                    </span>
                  )}
                  <Link
                    href={buildListingsHref({ category: slug, page: 1 })}
                    className="flex items-center gap-2"
                  >
                    <span className={`text-sm ${isActive ? "font-bold text-[var(--brand)]" : "font-semibold text-[var(--text)]"}`}>{cat.name.ar || cat.name.en}</span>
                    <CategoryIcon slug={slug} className={isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)]"} />
                  </Link>
                </div>
                {isExpanded && subs.length > 0 && (
                  <div className="motion-dropdown bg-[var(--surface-muted,var(--surface))]" data-motion-state="enter">
                    {subs.map((sub) => (
                      <Link
                        key={sub}
                        href={buildListingsHref({ category: slug, page: 1 })}
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
      </div>

      {/* Price filter */}
      <div className="ui-card overflow-hidden">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-bold text-[var(--text)] text-right">نطاق السعر</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localPriceMin}
              onChange={(e) => setLocalPriceMin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
              placeholder="من"
              min={0}
              aria-label="الحد الأدنى للسعر"
              className="ui-pill-input h-9 flex-1 text-center text-xs"
            />
            <span className="text-xs text-[var(--text-muted)]">—</span>
            <input
              type="number"
              value={localPriceMax}
              onChange={(e) => setLocalPriceMax(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
              placeholder="إلى"
              min={0}
              aria-label="الحد الأقصى للسعر"
              className="ui-pill-input h-9 flex-1 text-center text-xs"
            />
          </div>
          <button
            type="button"
            onClick={applyPriceFilter}
            className="ui-btn-primary w-full rounded-full py-1.5 text-xs"
          >
            تطبيق السعر
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="order-2 lg:order-1 hidden lg:block h-fit space-y-4">
        {sidebarContent}
      </aside>

      {/* Mobile filter toggle */}
      <div className="lg:hidden order-1">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          aria-expanded={mobileFiltersOpen}
          aria-label={mobileFiltersOpen ? "إخفاء الفلاتر" : "عرض الفلاتر"}
          className="ui-btn-ghost flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-2.5 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          <span>الفلاتر والتصنيفات</span>
          {hasAnyFilter && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-[var(--brand-contrast)]">
              {activeFilterChips.length}
            </span>
          )}
        </button>
        {mobileFiltersOpen && (
          <div className="motion-dropdown mt-3 space-y-4" data-motion-state="enter">
            {sidebarContent}
          </div>
        )}
      </div>

      {/* Listings area */}
      <div className="order-1 lg:order-2 space-y-4">
        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="motion-alert flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
            {activeFilterChips.map((chip) => (
              <Link
                key={chip.key}
                href={chip.onRemove}
                className={`motion-alert rounded-full border px-3 py-1 text-xs font-medium transition-colors ${chip.color}`}
              >
                {chip.label} ×
              </Link>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ui-btn-primary rounded-full px-3 py-1 text-xs"
            >
              مسح الفلاتر
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            {total} إعلان {total > 0 ? `(${startCount}-${endCount})` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {hasAnyFilter && currentUser ? (
              <button
                type="button"
                onClick={() => setSavePanelOpen((open) => !open)}
                className="ui-btn-ghost rounded-full border border-[var(--border)] px-3 py-1.5 text-xs"
              >
                حفظ البحث
              </button>
            ) : null}
            <select
              value={sort}
              onChange={(e) => {
                const nextSort = e.target.value as SortKey;
                if (isValidSort(nextSort)) {
                  router.replace(buildListingsHref({ sort: nextSort, page: 1 }));
                }
              }}
              aria-label="ترتيب النتائج"
              className="ui-pill-input ui-select h-9 border-[var(--border)] py-1.5 text-xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {savePanelOpen ? (
          <div className="motion-alert flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center">
            <input
              value={savedSearchName}
              onChange={(event) => setSavedSearchName(event.target.value)}
              placeholder="اسم البحث المحفوظ"
              maxLength={80}
              className="ui-pill-input h-9 flex-1 text-sm"
            />
            <button
              type="button"
              onClick={saveCurrentSearch}
              disabled={savingSearch}
              className="ui-btn-primary rounded-full px-4 py-2 text-xs disabled:opacity-60"
            >
              {savingSearch ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        ) : null}
        {saveSearchMessage ? <p className="text-xs text-[var(--text-muted)]">{saveSearchMessage}</p> : null}

        {/* Error state */}
        {error ? (
          <div className="motion-section rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-6 py-10 text-center space-y-4">
            <div className="flex justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--danger)]">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">حدث خطأ أثناء تحميل الإعلانات</p>
            <p className="text-xs text-[var(--text-muted)]">{error}</p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="ui-btn-primary rounded-full px-6 py-2 text-xs"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {listings.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} motionIndex={index} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="التنقل بين الصفحات" className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => router.replace(buildListingsHref({ page: safeCurrentPage - 1 }))}
                  disabled={!hasPreviousPage && safeCurrentPage <= 1}
                  aria-label="الصفحة السابقة"
                  className="ui-btn-ghost rounded-full px-4 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  السابق
                </button>
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
                      aria-label={`الصفحة ${pageNum}`}
                      aria-current={pageNum === safeCurrentPage ? "page" : undefined}
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
                  disabled={!hasNextPage && safeCurrentPage >= totalPages}
                  aria-label="الصفحة التالية"
                  className="ui-btn-ghost rounded-full px-4 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  التالي
                </button>
              </nav>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="motion-section rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center space-y-4">
            <div className="flex justify-center">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-[var(--text-muted)]">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <p className="text-base font-semibold text-[var(--text)]">لا توجد إعلانات مطابقة لبحثك</p>
            <p className="text-sm text-[var(--text-muted)]">
              {hasAnyFilter
                ? "جرّب تعديل الفلاتر أو البحث بكلمات مختلفة"
                : "لا توجد إعلانات منشورة حالياً"}
            </p>
            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {activeFilterChips.map((chip) => (
                  <span key={chip.key} className={`rounded-full border px-3 py-1 text-[11px] font-medium ${chip.color}`}>
                    {chip.label}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="ui-btn-ghost rounded-full border border-[var(--border)] px-5 py-2 text-xs"
                >
                  مسح الفلاتر
                </button>
              )}
              <Link href="/listings" className="ui-btn-primary rounded-full px-5 py-2 text-xs">
                العودة لكل الإعلانات
              </Link>
              <Link href="/submit-listing" className="ui-btn-ghost rounded-full border border-[var(--brand)] px-5 py-2 text-xs text-[var(--brand)]">
                أضف إعلانك
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PublicListingsPage() {
  return (
    <Suspense fallback={<ListingsPageSkeleton />}>
      <PublicListingsPageInner />
    </Suspense>
  );
}
