"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { getCategories } from "@/services/categoryService";
import { getMarketInsights } from "@/services/marketService";
import type { Category } from "@/types/category";
import type { MarketInsights } from "@/types/market";

export function MarketInsightsPage() {
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    void Promise.all([getMarketInsights(), getCategories()])
      .then(([insightsData, categoryData]) => {
        if (!mounted) return;
        setInsights(insightsData);
        setCategories(categoryData);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "تعذر تحميل إحصائيات السوق.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const categoryNames = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name.ar || category.name.en || category.slug]));
  }, [categories]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="motion-skeleton h-24 rounded-xl bg-[var(--surface)]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="motion-skeleton h-64 rounded-xl bg-[var(--surface)]" />
          <div className="motion-skeleton h-64 rounded-xl bg-[var(--surface)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="motion-alert rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>;
  }

  if (!insights) {
    return <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">لا توجد بيانات كافية بعد.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard label="إعلانات جديدة خلال 7 أيام" value={insights.newListings7d} />
        <InsightCard label="مدن نشطة" value={insights.topCities.length} />
        <InsightCard label="تصنيفات نشطة" value={insights.topCategories.length} />
        <InsightCard label="تصنيفات بأسعار مرجعية" value={insights.averagePricesByCategory.length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InsightSection title="أكثر المدن نشاطاً">
          <BarList
            items={insights.topCities.map((item) => ({
              label: item.city,
              value: item.listingCount,
              href: `/listings?city=${encodeURIComponent(item.city)}`,
            }))}
          />
        </InsightSection>
        <InsightSection title="أكثر التصنيفات نشاطاً">
          <BarList
            items={insights.topCategories.map((item) => ({
              label: categoryNames.get(item.categoryId) ?? item.categoryId,
              value: item.listingCount,
              href: `/listings?category=${encodeURIComponent(item.categoryId)}`,
            }))}
          />
        </InsightSection>
      </div>

      <InsightSection title="متوسط الأسعار حسب التصنيف">
        {insights.averagePricesByCategory.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                  <th className="px-3 py-2 text-start">التصنيف</th>
                  <th className="px-3 py-2 text-start">متوسط السعر</th>
                  <th className="px-3 py-2 text-start">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {insights.averagePricesByCategory.map((item) => (
                  <tr key={item.categoryId} className="border-b border-[var(--border)]">
                    <td className="px-3 py-2 font-semibold text-[var(--text)]">{categoryNames.get(item.categoryId) ?? item.categoryId}</td>
                    <td className="px-3 py-2 text-[var(--text)]">{formatCurrency(item.averagePrice)}</td>
                    <td className="px-3 py-2">
                      <Link href={`/listings?category=${encodeURIComponent(item.categoryId)}`} className="text-[var(--brand)] hover:underline">
                        تصفح
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyMarketState />
        )}
      </InsightSection>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="ui-card rounded-xl p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-[var(--text)]">{value}</p>
    </div>
  );
}

function InsightSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ui-card rounded-xl p-4">
      <h2 className="text-lg font-bold text-[var(--text)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BarList({ items }: { items: Array<{ label: string; value: number; href: string }> }) {
  if (!items.length) return <EmptyMarketState />;
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link key={`${item.label}-${item.href}`} href={item.href} className="grid grid-cols-[110px_1fr_44px] items-center gap-3 text-sm">
          <span className="truncate font-semibold text-[var(--text)]">{item.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <span className="block h-full rounded-full bg-[var(--brand)]" style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} />
          </span>
          <span className="text-end font-bold text-[var(--text)]">{item.value}</span>
        </Link>
      ))}
    </div>
  );
}

function EmptyMarketState() {
  return <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">لا توجد بيانات كافية بعد.</p>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar", { maximumFractionDigits: 0 }).format(value);
}
