"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories } from "@/services/categoryService";
import type { Category } from "@/types/category";

export function CategoriesDirectory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getCategories()
      .then((data) => {
        if (!mounted) return;
        setCategories(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load categories.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">جاري تحميل التصنيفات...</p>;
  }

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/listings?category=${encodeURIComponent(category.slug || category.id)}`}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <p className="font-semibold">{category.name.ar || category.name.en || category.slug}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{category.slug}</p>
        </Link>
      ))}
    </div>
  );
}
