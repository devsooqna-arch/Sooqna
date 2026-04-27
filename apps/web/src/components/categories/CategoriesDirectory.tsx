"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories } from "@/services/categoryService";
import type { Category } from "@/types/category";

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

export function CategoriesDirectory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getCategories()
      .then((data) => { if (mounted) setCategories(data); })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : "Failed to load categories."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--surface)]" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const slug = category.slug || category.id;
        const icon = CATEGORY_ICONS[slug] ?? "📦";
        return (
          <Link
            key={category.id}
            href={`/listings?category=${encodeURIComponent(slug)}`}
            className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] transition hover:border-[var(--brand)] hover:shadow-[var(--shadow-md)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl transition group-hover:scale-110">
              {icon}
            </span>
            <div>
              <p className="font-bold text-[var(--text)]">
                {category.name.ar || category.name.en || category.slug}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                تصفح إعلانات {category.name.ar || category.name.en || "هذا التصنيف"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
