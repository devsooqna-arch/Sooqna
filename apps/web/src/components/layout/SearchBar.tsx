"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { getCategories } from "@/services/categoryService";
import type { Category } from "@/types/category";

const CITY_OPTIONS = [
  { value: "amman", label: "عمّان" },
  { value: "zarqa", label: "الزرقاء" },
  { value: "irbid", label: "إربد" },
  { value: "aqaba", label: "العقبة" },
  { value: "salt", label: "السلط" },
  { value: "madaba", label: "مادبا" },
  { value: "karak", label: "الكرك" },
  { value: "jerash", label: "جرش" },
];

function SearchBarFallback() {
  return (
    <>
      <div className="hidden flex-1 items-center gap-2 md:flex">
        <input
          type="text"
          disabled
          placeholder="ماذا تبحث؟"
          className="ui-pill-input flex-1"
        />
        <button disabled className="ui-btn-ghost h-11 rounded-full px-5 opacity-70">
          كل التصنيفات ▾
        </button>
        <button disabled className="ui-btn-ghost h-11 rounded-full px-5 opacity-70">
          كل المدن ▾
        </button>
        <button
          disabled
          className="ui-btn-primary h-11 rounded-full px-8 opacity-70"
        >
          بحث
        </button>
      </div>

      <div className="flex flex-1 items-center gap-2 md:hidden">
        <input
          type="text"
          disabled
          placeholder="بحث..."
          className="ui-pill-input h-10 flex-1 px-4"
        />
        <button
          disabled
          className="ui-btn-primary h-10 rounded-full px-4 text-xs opacity-70"
        >
          بحث
        </button>
      </div>
    </>
  );
}

function ModernDropdown({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedLabel = options.find((item) => item.value === value)?.label || placeholder;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="ui-pill-input h-11 min-w-[160px] bg-[var(--chip)] text-[var(--text-muted)] shadow-[var(--shadow-sm)]"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 max-h-64 min-w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-md)]">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition ${
              value === "" ? "bg-[var(--brand)] text-[var(--brand-contrast)]" : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition ${
                value === option.value
                  ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
                  : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
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

  const buildListingsUrl = useCallback((nextQuery: string, nextCategory: string, nextCity: string): string => {
    const trimmedSearch = nextQuery.trim();
    const trimmedCategory = nextCategory.trim().toLowerCase();
    const trimmedCity = nextCity.trim().toLowerCase();
    const nextParams = new URLSearchParams(params.toString());

    if (trimmedSearch) {
      nextParams.set("search", trimmedSearch);
      nextParams.delete("category");
    } else {
      nextParams.delete("search");
      if (trimmedCategory) {
        nextParams.set("category", trimmedCategory);
      } else {
        nextParams.delete("category");
      }
    }
    if (trimmedCity) {
      nextParams.set("city", trimmedCity);
    } else {
      nextParams.delete("city");
    }
    nextParams.set("page", "1");

    const queryString = nextParams.toString();
    return queryString ? `/listings?${queryString}` : "/listings";
  }, [params]);

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
  }, [query, category, city, searchParam, categoryParam, cityParam, router, buildListingsUrl]);

  return (
    <>
      <div className="hidden flex-1 items-center gap-2 md:flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="ماذا تبحث؟"
          className="ui-pill-input flex-1"
        />
        <ModernDropdown
          value={category}
          placeholder="كل التصنيفات"
          options={categories.map((item) => ({
            value: (item.slug || item.id).toLowerCase(),
            label: item.name.ar || item.name.en || (item.slug || item.id).toLowerCase(),
          }))}
          onChange={(nextCategory) => {
            setCategory(nextCategory);
            applyFiltersImmediately(query, nextCategory, city);
          }}
        />
        <ModernDropdown
          value={city}
          placeholder="كل المدن"
          options={CITY_OPTIONS}
          onChange={(nextCity) => {
            setCity(nextCity);
            applyFiltersImmediately(query, category, nextCity);
          }}
        />
        <button
          onClick={handleSearch}
          className="ui-btn-primary h-11 rounded-full px-8"
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
          className="ui-pill-input h-10 flex-1 px-4"
        />
        <button
          onClick={handleSearch}
          className="ui-btn-primary h-10 rounded-full px-4 text-xs"
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
