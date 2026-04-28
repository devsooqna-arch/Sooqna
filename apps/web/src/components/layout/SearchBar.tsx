"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getCategories } from "@/services/categoryService";
import type { Category } from "@/types/category";

const CITY_OPTIONS = ["عمّان", "الزرقاء", "إربد", "العقبة", "السلط", "مادبا", "الكرك", "جرش"];

function SearchBarFallback() {
  return (
    <>
      <div className="hidden flex-1 items-center gap-2 md:flex">
        <input
          type="text"
          disabled
          placeholder="ماذا تبحث؟"
          className="h-11 flex-1 rounded-full border border-[var(--chip-border)] bg-[var(--surface)] px-5 text-sm outline-none focus:border-[var(--brand)]"
        />
        <button disabled className="h-11 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-5 text-sm text-[var(--text-muted)]">
          كل التصنيفات ▾
        </button>
        <button disabled className="h-11 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-5 text-sm text-[var(--text-muted)]">
          كل المدن ▾
        </button>
        <button
          disabled
          className="h-11 rounded-full bg-[var(--brand)] px-8 text-sm font-semibold text-[var(--brand-contrast)] opacity-70"
        >
          بحث
        </button>
      </div>

      <div className="flex flex-1 items-center gap-2 md:hidden">
        <input
          type="text"
          disabled
          placeholder="بحث..."
          className="h-10 flex-1 rounded-full border border-[var(--chip-border)] bg-[var(--surface)] px-4 text-sm outline-none focus:border-[var(--brand)]"
        />
        <button
          disabled
          className="h-10 rounded-full bg-[var(--brand)] px-4 text-xs font-semibold text-[var(--brand-contrast)] opacity-70"
        >
          بحث
        </button>
      </div>
    </>
  );
}

function SearchBarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const searchParam = params.get("search") ?? "";
  const categoryParam = params.get("category") ?? "";
  const cityParam = params.get("city") ?? "";

  const [query, setQuery] = useState(searchParam);
  const [category, setCategory] = useState(categoryParam);
  const [city, setCity] = useState(cityParam);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let mounted = true;
    void getCategories()
      .then((items) => {
        if (!mounted) return;
        setCategories(items);
      })
      .catch(() => {
        if (!mounted) return;
        setCategories([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setQuery(searchParam);
    setCategory(categoryParam);
    setCity(cityParam);
  }, [searchParam, categoryParam, cityParam]);

  function buildListingsUrl(nextQuery: string, nextCategory: string, nextCity: string): string {
    const trimmedSearch = nextQuery.trim();
    const trimmedCategory = nextCategory.trim();
    const trimmedCity = nextCity.trim();
    const nextParams = new URLSearchParams();

    if (trimmedSearch) {
      nextParams.set("search", trimmedSearch);
    }
    if (trimmedCategory) {
      nextParams.set("category", trimmedCategory);
    }
    if (trimmedCity) {
      nextParams.set("city", trimmedCity);
    }

    const queryString = nextParams.toString();
    return queryString ? `/listings?${queryString}` : "/listings";
  }

  function applyFiltersImmediately(nextQuery: string, nextCategory: string, nextCity: string) {
    router.replace(buildListingsUrl(nextQuery, nextCategory, nextCity));
  }

  function handleSearch() {
    applyFiltersImmediately(query, category, city);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextUrl = buildListingsUrl(query, category, city);
      const currentUrl = buildListingsUrl(searchParam, categoryParam, cityParam);
      if (nextUrl !== currentUrl) {
        router.replace(nextUrl);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, category, city, searchParam, categoryParam, cityParam, router]);

  return (
    <>
      <div className="hidden flex-1 items-center gap-2 md:flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="ماذا تبحث؟"
          className="h-11 flex-1 rounded-full border border-[var(--chip-border)] bg-[var(--surface)] px-5 text-sm outline-none focus:border-[var(--brand)]"
        />
        <select
          value={category}
          onChange={(e) => {
            const nextCategory = e.target.value;
            setCategory(nextCategory);
            applyFiltersImmediately(query, nextCategory, city);
          }}
          className="h-11 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-5 text-sm text-[var(--text-muted)] outline-none focus:border-[var(--brand)]"
        >
          <option value="">كل التصنيفات</option>
          {categories.map((item) => {
            const value = item.slug || item.id;
            const label = item.name.ar || item.name.en || value;
            return (
              <option key={item.id} value={value}>
                {label}
              </option>
            );
          })}
        </select>
        <select
          value={city}
          onChange={(e) => {
            const nextCity = e.target.value;
            setCity(nextCity);
            applyFiltersImmediately(query, category, nextCity);
          }}
          className="h-11 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-5 text-sm text-[var(--text-muted)] outline-none focus:border-[var(--brand)]"
        >
          <option value="">كل المدن</option>
          {CITY_OPTIONS.map((cityOption) => (
            <option key={cityOption} value={cityOption}>
              {cityOption}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="h-11 rounded-full bg-[var(--brand)] px-8 text-sm font-semibold text-[var(--brand-contrast)]"
        >
          بحث
        </button>
      </div>

      <div className="flex flex-1 items-center gap-2 md:hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="بحث..."
          className="h-10 flex-1 rounded-full border border-[var(--chip-border)] bg-[var(--surface)] px-4 text-sm outline-none focus:border-[var(--brand)]"
        />
        <button
          onClick={handleSearch}
          className="h-10 rounded-full bg-[var(--brand)] px-4 text-xs font-semibold text-[var(--brand-contrast)]"
        >
          بحث
        </button>
      </div>
    </>
  );
}

export function SearchBar() {
  return (
    <Suspense fallback={<SearchBarFallback />}>
      <SearchBarInner />
    </Suspense>
  );
}
