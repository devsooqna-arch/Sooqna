"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/types/category";
import { getCategories } from "@/services/categoryService";

export function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void getCategories()
      .then((result) => {
        if (!mounted) return;
        setCategories(result);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load categories");
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
    return <p className="text-sm text-slate-500">Loading categories...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!categories.length) {
    return <p className="text-sm text-slate-500">No active categories found.</p>;
  }

  return (
    <ul className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white p-4">
      {categories.map((category) => (
        <li key={category.id} className="rounded border border-slate-100 p-3 text-sm">
          <p className="font-medium text-slate-900">
            {category.name.ar} / {category.name.en}
          </p>
          <p className="text-slate-500">slug: {category.slug}</p>
        </li>
      ))}
    </ul>
  );
}
