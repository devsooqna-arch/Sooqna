"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { attachListingImage, createListing, publishListing } from "@/services/listingService";
import { getCategories } from "@/services/categoryService";
import { uploadBackendListingImage } from "@/services/backendUploadService";
import type { Category } from "@/types/category";
import { useAuth } from "@/hooks/useAuth";
import { RequireVerifiedEmailGate } from "@/components/auth/RequireVerifiedEmailGate";
import { SYRIAN_GOVERNORATES } from "@/lib/locations";
import { SUBCATEGORIES } from "@/lib/categorySubcategories";
import { arabicCity } from "@/lib/locationNames";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const WIZARD_STEPS = [
  { key: "category", label: "التصنيف والموقع" },
  { key: "details", label: "تفاصيل الإعلان" },
  { key: "media", label: "السعر والصور" },
  { key: "preview", label: "المعاينة والنشر" },
] as const;

type UploadStage = "queued" | "uploading" | "uploaded" | "failed";
type DraftImage = {
  id: string;
  file: File;
  previewUrl: string;
  stage: UploadStage;
  error?: string;
};

type StepErrors = Record<string, string | undefined>;

function GuestCTA() {
  return (
    <section className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)]/10">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--brand)]">
          <path d="M12 4v16m-8-8h16" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-[var(--text)]">أضف إعلانك مجاناً</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        إضافة الإعلان مجانية وتحتاج تسجيل الدخول وتأكيد البريد لحماية المستخدمين.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/login?next=/submit-listing"
          className="ui-btn-primary rounded-full px-6 py-2.5 text-sm font-semibold"
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/register?next=/submit-listing"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--chip)]"
        >
          إنشاء حساب
        </Link>
      </div>
    </section>
  );
}

export function SubmitListingPage() {
  const { currentUser, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"SYP" | "USD">("SYP");
  const [images, setImages] = useState<DraftImage[]>([]);

  const [activeStep, setActiveStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [publishState, setPublishState] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  const submittingRef = useRef(false);
  const clientRequestIdRef = useRef<string | null>(null);

  const loadCategories = useCallback(() => {
    setCategoryLoading(true);
    setCategoryError(null);
    void getCategories()
      .then((items) => {
        setCategories(items);
      })
      .catch((err) => {
        setCategoryError(err instanceof Error ? err.message : "فشل تحميل التصنيفات.");
      })
      .finally(() => {
        setCategoryLoading(false);
      });
  }, []);

  useEffect(() => {
    if (currentUser) loadCategories();
  }, [currentUser, loadCategories]);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.name.ar || c.name.en || c.slug,
      })),
    [categories]
  );

  const subcategoryOptions = useMemo(
    () => (categoryId ? SUBCATEGORIES[categoryId] ?? [] : []),
    [categoryId]
  );

  function clearStepError(field: string) {
    setStepErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateStep(step: number): StepErrors {
    const errors: StepErrors = {};
    if (step === 0) {
      if (!categoryId) errors.categoryId = "اختر التصنيف.";
      if (!city) errors.city = "اختر المدينة.";
    } else if (step === 1) {
      if (!title.trim()) errors.title = "عنوان الإعلان مطلوب.";
      else if (title.trim().length > 160) errors.title = "العنوان طويل جداً (الحد 160 حرف).";
      if (description.length > 10000) errors.description = "الوصف طويل جداً (الحد 10000 حرف).";
    } else if (step === 2) {
      const priceNum = Number(price);
      if (price.trim() === "") errors.price = "السعر مطلوب.";
      else if (!Number.isFinite(priceNum) || priceNum < 0) errors.price = "السعر غير صالح.";
      if (images.length === 0) errors.images = "أضف صورة واحدة على الأقل للنشر.";
    }
    return errors;
  }

  function goToStep(target: number) {
    if (target < activeStep) {
      setStepErrors({});
      setGlobalError(null);
      setActiveStep(target);
      return;
    }
    for (let s = activeStep; s < target; s++) {
      const errors = validateStep(s);
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        setActiveStep(s);
        return;
      }
    }
    setStepErrors({});
    setGlobalError(null);
    setActiveStep(target);
  }

  function nextStep() {
    const errors = validateStep(activeStep);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors({});
    setGlobalError(null);
    setActiveStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  }

  function prevStep() {
    setStepErrors({});
    setGlobalError(null);
    setActiveStep((prev) => Math.max(prev - 1, 0));
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
    clearStepError("images");
    setGlobalError(null);
    if (!files || !files.length) return;
    const fileList = Array.from(files);
    const validationError = validateImages(fileList);
    if (validationError) {
      setStepErrors((prev) => ({ ...prev, images: validationError }));
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

  function setPrimaryImage(id: string) {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);
      if (index <= 0) return prev;
      const item = prev[index];
      return [item, ...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  }

  async function uploadImagesForListing(listingId: string): Promise<void> {
    for (const image of images) {
      if (image.stage === "uploaded") continue;
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
        throw new Error(`فشل رفع الصورة "${image.file.name}": ${message}`);
      }
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current || busy) return;

    for (let s = 0; s < WIZARD_STEPS.length - 1; s++) {
      const errors = validateStep(s);
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        setActiveStep(s);
        return;
      }
    }

    submittingRef.current = true;
    clientRequestIdRef.current ??= crypto.randomUUID();
    setBusy(true);
    setGlobalError(null);
    setPublishState("جارٍ إنشاء المسودة...");

    try {
      const result = await createListing(
        {
          title: title.trim(),
          price: Number(price),
          currency,
          categoryId: categoryId.trim(),
          description: description.trim(),
          location: {
            country: "Syria",
            city: city.trim(),
            area: area.trim() || city.trim(),
          },
        },
        clientRequestIdRef.current
      );

      setPublishState(`جارٍ رفع ${images.length} صور...`);
      await uploadImagesForListing(result.listingId);

      setPublishState("جارٍ إرسال الإعلان للمراجعة...");
      await publishListing(result.listingId);

      setPublishState(null);
      setCreatedListingId(result.listingId);
      clientRequestIdRef.current = null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر إنشاء الإعلان.";
      setGlobalError(mapApiError(message));
      setPublishState(null);
    } finally {
      setBusy(false);
      submittingRef.current = false;
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[var(--text-muted)]">جارٍ التحقق من الجلسة...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <GuestCTA />;
  }

  if (createdListingId) {
    return (
      <section className="mx-auto max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-700">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-emerald-900">تم إرسال إعلانك للمراجعة</h2>
        <p className="mt-2 text-sm text-emerald-800">سيظهر الإعلان في البحث بعد موافقة فريق الإدارة.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/my-listings"
            className="ui-btn-primary rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            متابعة حالة الإعلان
          </Link>
          <Link
            href="/my-listings"
            className="rounded-full border border-emerald-300 bg-white px-6 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
          >
            إعلاناتي
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreatedListingId(null);
              setActiveStep(0);
              setTitle("");
              setDescription("");
              setPrice("");
              setCurrency("SYP");
              setCategoryId("");
              setSubcategory("");
              setCity("");
              setArea("");
              images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
              setImages([]);
              setGlobalError(null);
              setStepErrors({});
            }}
            className="rounded-full border border-emerald-300 bg-white px-6 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
          >
            إضافة إعلان جديد
          </button>
        </div>
      </section>
    );
  }

  return (
    <RequireVerifiedEmailGate>
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Step Indicator */}
        <nav className="flex gap-1 overflow-x-auto sm:gap-2" aria-label="خطوات إضافة الإعلان">
          {WIZARD_STEPS.map((step, idx) => (
            <button
              key={step.key}
              type="button"
              onClick={() => goToStep(idx)}
              disabled={busy}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                idx === activeStep
                  ? "bg-[var(--brand)] text-[var(--brand-contrast)] shadow-sm"
                  : idx < activeStep
                    ? "bg-[var(--brand)]/15 text-[var(--brand)]"
                    : "bg-[var(--chip)] text-[var(--text-muted)]"
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none sm:h-6 sm:w-6 sm:text-xs ${idx < activeStep ? 'bg-[var(--brand)] text-white' : ''}">
                {idx < activeStep ? "✓" : idx + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          ))}
        </nav>

        {/* Global Error */}
        {globalError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">حدث خطأ</p>
            <p className="mt-1">{globalError}</p>
            {globalError.includes("الجلسة") && (
              <button type="button" onClick={() => window.location.reload()} className="mt-2 text-xs font-semibold text-red-900 underline">
                إعادة تحميل الصفحة
              </button>
            )}
          </div>
        )}

        {/* Publish Progress */}
        {publishState && (
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            {publishState}
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6">
          {/* Step 0: Category & Location */}
          {activeStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[var(--text)]">التصنيف والموقع</h3>

              <FieldWrapper label="التصنيف" error={stepErrors.categoryId} required>
                {categoryLoading ? (
                  <p className="text-xs text-[var(--text-muted)]">جارٍ تحميل التصنيفات...</p>
                ) : categoryError ? (
                  <div className="flex items-center gap-2 text-xs text-[var(--danger)]">
                    <span>{categoryError}</span>
                    <button type="button" onClick={loadCategories} className="underline hover:opacity-80">إعادة المحاولة</button>
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value); setSubcategory(""); clearStepError("categoryId"); }}
                    className="ui-input ui-select w-full rounded-xl"
                    disabled={busy}
                  >
                    <option value="">اختر التصنيف</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </FieldWrapper>

              {subcategoryOptions.length > 0 && (
                <FieldWrapper label="التصنيف الفرعي">
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="ui-input ui-select w-full rounded-xl"
                    disabled={busy}
                  >
                    <option value="">اختياري</option>
                    {subcategoryOptions.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </FieldWrapper>
              )}

              <FieldWrapper label="المدينة" error={stepErrors.city} required>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); clearStepError("city"); }}
                  className="ui-input ui-select w-full rounded-xl"
                  disabled={busy}
                >
                  <option value="">اختر المدينة</option>
                  {SYRIAN_GOVERNORATES.map((g) => (
                    <option key={g.value} value={g.value}>{g.labelAr}</option>
                  ))}
                </select>
              </FieldWrapper>

              <FieldWrapper label="المنطقة">
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="ui-input w-full rounded-xl"
                  placeholder="اختياري — مثال: الفرقان"
                  disabled={busy}
                />
              </FieldWrapper>
            </div>
          )}

          {/* Step 1: Details */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[var(--text)]">تفاصيل الإعلان</h3>

              <FieldWrapper label="عنوان الإعلان" error={stepErrors.title} required hint={`${title.length}/160`}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); clearStepError("title"); }}
                  className="ui-input w-full rounded-xl"
                  placeholder="مثال: كاميرا سوني A7 III بحالة ممتازة"
                  maxLength={160}
                  disabled={busy}
                />
              </FieldWrapper>

              <FieldWrapper label="وصف الإعلان" error={stepErrors.description} hint={`${description.length}/10000`}>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); clearStepError("description"); }}
                  className="ui-input h-auto w-full rounded-xl py-2"
                  placeholder="اكتب وصفاً واضحاً يتضمن الحالة والمواصفات وطريقة التواصل..."
                  maxLength={10000}
                  disabled={busy}
                />
              </FieldWrapper>
            </div>
          )}

          {/* Step 2: Price & Images */}
          {activeStep === 2 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[var(--text)]">السعر والصور</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldWrapper label="السعر" error={stepErrors.price} required>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); clearStepError("price"); }}
                    className="ui-input w-full rounded-xl"
                    placeholder="0"
                    min="0"
                    disabled={busy}
                  />
                </FieldWrapper>

                <FieldWrapper label="العملة">
                  <div className="flex overflow-hidden rounded-xl border border-[var(--border)] text-sm font-semibold">
                    <button
                      type="button"
                      onClick={() => setCurrency("SYP")}
                      disabled={busy}
                      className={`flex-1 px-4 py-2.5 transition ${currency === "SYP" ? "bg-[var(--brand)] text-[var(--brand-contrast)]" : "bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--chip)]"}`}
                    >
                      ل.س
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency("USD")}
                      disabled={busy}
                      className={`flex-1 px-4 py-2.5 transition ${currency === "USD" ? "bg-[var(--brand)] text-[var(--brand-contrast)]" : "bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--chip)]"}`}
                    >
                      $
                    </button>
                  </div>
                </FieldWrapper>
              </div>

              {/* Image Upload */}
              <FieldWrapper label={`الصور (${images.length}/${MAX_IMAGES})`} error={stepErrors.images} required>
                <div className="space-y-3">
                  <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition ${images.length >= MAX_IMAGES ? "border-[var(--border)] bg-[var(--chip)] opacity-50" : "border-[var(--brand)]/30 bg-[var(--brand)]/5 hover:border-[var(--brand)]/50"}`}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--brand)]">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      {images.length >= MAX_IMAGES ? "وصلت الحد الأقصى" : "اضغط لاختيار الصور — JPG/PNG/WEBP حتى 5MB"}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => { onPickImages(e.target.files); e.target.value = ""; }}
                      disabled={busy || images.length >= MAX_IMAGES}
                      className="hidden"
                    />
                  </label>

                  {images.length > 0 && (
                    <p className="text-xs text-[var(--text-muted)]">الصورة الأولى ستكون الصورة الرئيسية للإعلان.</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((img, idx) => (
                      <div key={img.id} className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="relative aspect-square">
                          <Image
                            src={img.previewUrl}
                            alt={`صورة ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {idx === 0 && (
                            <span className="absolute right-1 top-1 rounded-full bg-[var(--brand)] px-2 py-0.5 text-[9px] font-bold text-white">
                              رئيسية
                            </span>
                          )}
                          {img.stage === "uploading" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                              </svg>
                            </div>
                          )}
                          {img.stage === "uploaded" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/30">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                          {img.stage === "failed" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-900/30">
                              <span className="text-xs font-bold text-white">فشل</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-1 px-1.5 py-1.5">
                          <div className="flex gap-0.5">
                            <button type="button" onClick={() => moveImage(img.id, "up")} disabled={idx === 0 || busy} className="rounded p-1 text-xs text-[var(--text-muted)] hover:bg-[var(--chip)] disabled:opacity-30" title="تقديم">◀</button>
                            <button type="button" onClick={() => moveImage(img.id, "down")} disabled={idx === images.length - 1 || busy} className="rounded p-1 text-xs text-[var(--text-muted)] hover:bg-[var(--chip)] disabled:opacity-30" title="تأخير">▶</button>
                            {idx !== 0 && (
                              <button type="button" onClick={() => setPrimaryImage(img.id)} disabled={busy} className="rounded p-1 text-[9px] font-bold text-[var(--brand)] hover:bg-[var(--chip)]" title="جعلها رئيسية">★</button>
                            )}
                          </div>
                          <button type="button" onClick={() => removeImage(img.id)} disabled={busy} className="rounded p-1 text-xs text-red-600 hover:bg-red-50" title="حذف">✕</button>
                        </div>
                        {img.error && (
                          <p className="px-1.5 pb-1 text-[10px] text-red-700">{img.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </FieldWrapper>
            </div>
          )}

          {/* Step 3: Preview & Publish */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[var(--text)]">معاينة الإعلان</h3>

              {/* Preview Card */}
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--chip)]">
                {images.length > 0 && (
                  <div className="relative h-48 w-full bg-[var(--surface-muted)] sm:h-64">
                    <Image
                      src={images[0].previewUrl}
                      alt="صورة الإعلان الرئيسية"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {images.length > 1 && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                        +{images.length - 1} صور
                      </span>
                    )}
                  </div>
                )}
                <div className="space-y-3 p-4">
                  <h4 className="text-lg font-bold text-[var(--text)]">{title || "—"}</h4>
                  <p className="text-xl font-bold text-[var(--brand)]">
                    {price || "0"} {currency === "SYP" ? "ل.س" : "$"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                    <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                      {categoryOptions.find((c) => c.id === categoryId)?.label || "—"}
                    </span>
                    {subcategory && (
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">{subcategory}</span>
                    )}
                    <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                      {arabicCity(city)}{area ? ` - ${area}` : ""}
                    </span>
                  </div>
                  {description && (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">
                      {description.length > 300 ? description.slice(0, 300) + "..." : description}
                    </p>
                  )}
                  <p className="text-xs text-[var(--text-muted)]">{images.length} صور</p>
                </div>
              </div>

              {/* Validation Summary */}
              <PrePublishChecklist
                checks={[
                  { label: "التصنيف", ok: !!categoryId },
                  { label: "المدينة", ok: !!city },
                  { label: "العنوان", ok: !!title.trim() },
                  { label: "السعر", ok: price.trim() !== "" && Number(price) >= 0 },
                  { label: "صورة واحدة على الأقل", ok: images.length > 0 },
                ]}
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="sticky bottom-0 z-10 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-lg sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:shadow-none">
          {activeStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={busy}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--chip)] disabled:opacity-50"
            >
              السابق
            </button>
          )}
          <div className="flex-1" />
          {activeStep < WIZARD_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={busy}
              className="ui-btn-primary rounded-full px-6 py-2.5 text-sm font-semibold"
            >
              التالي
            </button>
          ) : (
            <button
              type="submit"
              disabled={busy || categoryLoading || images.length === 0}
              className="ui-btn-primary rounded-full px-6 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              {busy ? "جارٍ النشر..." : "نشر الإعلان"}
            </button>
          )}
        </div>
      </form>
    </RequireVerifiedEmailGate>
  );
}

function FieldWrapper({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[var(--text)]">
          {label}
          {required && <span className="mr-0.5 text-red-500">*</span>}
        </span>
        {hint && <span className="text-[11px] text-[var(--text-muted)]">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function PrePublishChecklist({ checks }: { checks: Array<{ label: string; ok: boolean }> }) {
  const allOk = checks.every((c) => c.ok);
  return (
    <div className={`rounded-xl border p-3 text-sm ${allOk ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <p className={`font-semibold ${allOk ? "text-emerald-800" : "text-amber-800"}`}>
        {allOk ? "الإعلان جاهز للنشر" : "تحقق من البيانات التالية قبل النشر"}
      </p>
      <ul className="mt-2 space-y-1">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-2 text-xs ${c.ok ? "text-emerald-700" : "text-amber-700"}`}>
            <span>{c.ok ? "✓" : "✗"}</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function mapApiError(message: string): string {
  if (message.includes("EMAIL_NOT_VERIFIED")) return "يجب تفعيل البريد الإلكتروني قبل إضافة الإعلان.";
  if (message.includes("UNAUTHORIZED") || message.includes("401")) return "انتهت الجلسة. أعد تسجيل الدخول وحاول مجدداً.";
  if (message.includes("FORBIDDEN") || message.includes("403")) return "ليس لديك صلاحية لتنفيذ هذا الإجراء.";
  if (message.includes("CONTENT_POLICY_VIOLATION")) return "يحتوي الإعلان على كلمات غير مسموحة. عدّل النص وحاول مجدداً.";
  if (message.includes("ACCOUNT_NOT_ACTIVE")) return "حسابك معلّق. تواصل مع الدعم.";
  if (message.includes("At least one image")) return "أضف صورة واحدة على الأقل قبل النشر.";
  if (message.includes("انتهت مهلة")) return "انتهت مهلة الاتصال بالخادم. تحقق من اتصالك بالإنترنت.";
  if (message.includes("طلبات كثيرة")) return message;
  return message;
}
