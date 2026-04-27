"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/services/listingService";
import { getCategories } from "@/services/categoryService";
import type { Category } from "@/types/category";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { ImageUpload } from "@/components/listings/ImageUpload";

export function SubmitListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("Jordan");
  const [city, setCity] = useState("Amman");
  const [area, setArea] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getCategories()
      .then((items) => {
        if (!mounted) return;
        setCategories(items);
        if (items.length) {
          setCategoryId(items[0].id);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setCategoryError(err instanceof Error ? err.message : "Failed to load categories.");
      })
      .finally(() => {
        if (!mounted) return;
        setCategoryLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        label: category.name.ar || category.name.en || category.slug,
      })),
    [categories]
  );

  function validate(): string | null {
    if (!title.trim()) return "عنوان الإعلان مطلوب.";
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) return "السعر غير صالح.";
    if (!categoryId.trim()) return "اختر التصنيف.";
    if (!country.trim() || !city.trim()) return "الدولة والمدينة مطلوبتان.";
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    try {
      const result = await createListing({
        title: title.trim(),
        price: Number(price),
        categoryId: categoryId.trim(),
        description: description.trim(),
        location: {
          country: country.trim(),
          city: city.trim(),
          area: area.trim() || city.trim(),
        },
      });
      setCreatedListingId(result.listingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الإعلان.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من تسجيل الدخول قبل إنشاء الإعلان...">
      <div className="space-y-5">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
        >
          {error ? (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {createdListingId ? (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 space-y-3">
              <p className="font-semibold">✅ تم إنشاء الإعلان بنجاح!</p>
              <p className="text-xs text-emerald-700">أضف صوراً للإعلان أدناه، ثم انتقل لعرض إعلانك.</p>
              <ImageUpload listingId={createdListingId} />
              <button
                type="button"
                onClick={() => router.push(`/listings/${createdListingId}`)}
                className="mt-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                عرض الإعلان ←
              </button>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">عنوان الإعلان</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                placeholder="مثال: كاميرا سوني A7"
                disabled={busy}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">السعر</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                placeholder="0"
                disabled={busy}
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-sm font-medium">وصف الإعلان</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              placeholder="اكتب وصفًا واضحًا لحالة المنتج ومواصفاته..."
              disabled={busy}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm font-medium">الدولة</span>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                disabled={busy}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">المدينة</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                disabled={busy}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium">المنطقة</span>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
                placeholder="اختياري"
                disabled={busy}
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-sm font-medium">التصنيف</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              disabled={busy || categoryLoading}
            >
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {categoryLoading ? (
              <p className="text-xs text-[var(--text-muted)]">جاري تحميل التصنيفات...</p>
            ) : null}
            {categoryError ? (
              <p className="text-xs text-[var(--danger)]">{categoryError}</p>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={busy || categoryLoading}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-contrast)] transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "جاري الإنشاء..." : "إنشاء الإعلان"}
          </button>
        </form>

      </div>
    </RequireAuthGate>
  );
}
