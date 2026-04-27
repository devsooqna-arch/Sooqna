"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

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
  const [query, setQuery] = useState(params.get("search") ?? "");

  function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/listings");
    } else {
      router.push(`/listings?search=${encodeURIComponent(trimmed)}`);
    }
  }

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
        <button className="h-11 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-5 text-sm text-[var(--text-muted)]">
          كل التصنيفات ▾
        </button>
        <button className="h-11 rounded-full border border-[var(--chip-border)] bg-[var(--chip)] px-5 text-sm text-[var(--text-muted)]">
          كل المدن ▾
        </button>
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
