"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { attachListingImage, createListing } from "@/services/listingService";
import { getCategories } from "@/services/categoryService";
import { uploadBackendListingImage } from "@/services/backendUploadService";
import type { Category } from "@/types/category";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const STEPS = ["تفاصيل الإعلان", "الصور", "المراجعة والنشر"] as const;

type UploadStage = "queued" | "uploading" | "uploaded" | "failed";
type DraftImage = {
  id: string;
  file: File;
  previewUrl: string;
  stage: UploadStage;
  error?: string;
};

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
  const [images, setImages] = useState<DraftImage[]>([]);

  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [optimisticNote, setOptimisticNote] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getCategories()
      .then((items) => {
        if (!mounted) return;
        setCategories(items);
        if (items.length) setCategoryId(items[0].id);
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

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

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

  function validateImages(files: File[]): string | null {
    if (images.length + files.length > MAX_IMAGES) return `الحد الأقصى للصور هو ${MAX_IMAGES}.`;
    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) return `نوع الصورة غير مدعوم: ${file.name}`;
      if (file.size > MAX_IMAGE_SIZE_BYTES) return `الصورة ${file.name} تتجاوز 5MB.`;
    }
    return null;
  }

  function onPickImages(files: FileList | null) {
    setError(null);
    if (!files || !files.length) return;
    const fileList = Array.from(files);
    const validationError = validateImages(fileList);
    if (validationError) {
      setError(validationError);
      return;
    }
    const next: DraftImage[] = fileList.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      stage: "queued",
    }));
    setImages((prev) => [...prev, ...next]);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  }

  function moveImage(id: string, direction: "up" | "down") {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);
      if (index < 0) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const cloned = [...prev];
      [cloned[index], cloned[nextIndex]] = [cloned[nextIndex], cloned[index]];
      return cloned;
    });
  }

  async function uploadImagesForListing(listingId: string): Promise<void> {
    for (const image of images) {
      setImages((prev) => prev.map((item) => (item.id === image.id ? { ...item, stage: "uploading" } : item)));
      try {
        const uploaded = await uploadBackendListingImage(image.file);
        await attachListingImage(listingId, uploaded);
        setImages((prev) => prev.map((item) => (item.id === image.id ? { ...item, stage: "uploaded" } : item)));
      } catch (uploadErr) {
        const message = uploadErr instanceof Error ? uploadErr.message : "فشل رفع الصورة.";
        setImages((prev) =>
          prev.map((item) => (item.id === image.id ? { ...item, stage: "failed", error: message } : item))
        );
        throw new Error(message);
      }
    }
  }

  function nextStep() {
    setError(null);
    if (activeStep === 0) {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }

  function prevStep() {
    setError(null);
    setActiveStep((prev) => Math.max(prev - 1, 0));
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
    setOptimisticNote("جارٍ إنشاء الإعلان...");
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
      setOptimisticNote("تم إنشاء الإعلان. جارٍ رفع الصور...");
      if (images.length > 0) {
        await uploadImagesForListing(result.listingId);
      }
      setOptimisticNote("تم نشر الإعلان وتجهيز الصور بنجاح.");
      setCreatedListingId(result.listingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الإعلان.");
      setOptimisticNote(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من تسجيل الدخول قبل إنشاء الإعلان...">
      <div className="space-y-5">
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-3 gap-2">
            {STEPS.map((step, idx) => (
              <div key={step} className={`rounded-lg px-2 py-2 text-center text-xs font-semibold ${idx === activeStep ? "bg-[var(--brand)] text-[var(--brand-contrast)]" : "bg-[var(--chip)] text-[var(--text-muted)]"}`}>
                {idx + 1}. {step}
              </div>
            ))}
          </div>

          {error ? <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
          {optimisticNote ? <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">{optimisticNote}</p> : null}

          {createdListingId ? (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 space-y-3">
              <p className="font-semibold">✅ تم إنشاء الإعلان بنجاح!</p>
              <button type="button" onClick={() => router.push(`/listings/${createdListingId}`)} className="mt-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                عرض الإعلان ←
              </button>
            </div>
          ) : null}

          {activeStep === 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1"><span className="text-sm font-medium">عنوان الإعلان</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" placeholder="مثال: كاميرا سوني A7" disabled={busy} /></label>
                <label className="space-y-1"><span className="text-sm font-medium">السعر</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" placeholder="0" disabled={busy} /></label>
              </div>
              <label className="space-y-1"><span className="text-sm font-medium">وصف الإعلان</span><textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" placeholder="اكتب وصفًا واضحًا..." disabled={busy} /></label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1"><span className="text-sm font-medium">الدولة</span><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" disabled={busy} /></label>
                <label className="space-y-1"><span className="text-sm font-medium">المدينة</span><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" disabled={busy} /></label>
                <label className="space-y-1"><span className="text-sm font-medium">المنطقة</span><input type="text" value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" placeholder="اختياري" disabled={busy} /></label>
              </div>
              <label className="space-y-1">
                <span className="text-sm font-medium">التصنيف</span>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" disabled={busy || categoryLoading}>
                  {categoryOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
                {categoryLoading ? <p className="text-xs text-[var(--text-muted)]">جاري تحميل التصنيفات...</p> : null}
                {categoryError ? <p className="text-xs text-[var(--danger)]">{categoryError}</p> : null}
              </label>
            </>
          ) : null}

          {activeStep === 1 ? (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-muted)]">أضف حتى {MAX_IMAGES} صور. JPG/PNG/WEBP وبحجم أقصى 5MB للصورة.</p>
              <input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => onPickImages(e.target.files)} disabled={busy} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
              {images.map((img, idx) => (
                <div key={img.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
                  <Image src={img.previewUrl} alt={`preview-${idx + 1}`} width={56} height={56} className="h-14 w-14 rounded-md object-cover" unoptimized />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--text)]">{img.file.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">الترتيب {idx + 1} • {img.stage}</p>
                    {img.error ? <p className="text-[11px] text-red-700">{img.error}</p> : null}
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveImage(img.id, "up")} className="rounded border border-[var(--border)] px-2 py-1 text-xs">↑</button>
                    <button type="button" onClick={() => moveImage(img.id, "down")} className="rounded border border-[var(--border)] px-2 py-1 text-xs">↓</button>
                    <button type="button" onClick={() => removeImage(img.id)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-700">حذف</button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeStep === 2 ? (
            <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--chip)] p-3 text-sm">
              <p><strong>العنوان:</strong> {title || "-"}</p>
              <p><strong>السعر:</strong> {price || "0"} دينار</p>
              <p><strong>التصنيف:</strong> {categoryOptions.find((c) => c.id === categoryId)?.label || "-"}</p>
              <p><strong>الموقع:</strong> {country} / {city} / {area || city}</p>
              <p><strong>عدد الصور:</strong> {images.length}</p>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button type="button" onClick={prevStep} disabled={busy || activeStep === 0} className="rounded-full border border-[var(--chip-border)] px-4 py-2 text-xs font-semibold disabled:opacity-50">السابق</button>
            {activeStep < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep} disabled={busy} className="rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-[var(--brand-contrast)]">التالي</button>
            ) : (
              <button type="submit" disabled={busy || categoryLoading} className="rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-bold text-[var(--brand-contrast)] disabled:opacity-60">{busy ? "جارٍ النشر..." : "نشر الإعلان"}</button>
            )}
          </div>
        </form>
      </div>
    </RequireAuthGate>
  );
}
