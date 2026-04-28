"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import {
  deleteListing,
  expireListing,
  getListingById,
  publishListing,
  renewListing,
  unpublishListing,
  updateListing,
} from "@/services/listingService";
import { ImageUpload } from "@/components/listings/ImageUpload";
import type { Listing } from "@/types/listing";

export function EditListingPageView({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [statusActionBusy, setStatusActionBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    void getListingById(listingId)
      .then((item) => {
        if (!mounted) return;
        if (!item) {
          setError("الإعلان غير موجود.");
          return;
        }
        if (currentUser && item.ownerId !== currentUser.uid) {
          setError("غير مصرح لك بتعديل هذا الإعلان.");
          return;
        }
        setListing(item);
        setTitle(item.title);
        setPrice(String(item.price));
        setDescription(item.description || "");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load listing.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [listingId, currentUser]);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const parsedPrice = Number(price);
    if (!title.trim()) {
      setError("عنوان الإعلان مطلوب.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("السعر غير صالح.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateListing(listingId, {
        title: title.trim(),
        price: parsedPrice,
        description: description.trim(),
      });
      setListing(updated);
      setSuccess("تم حفظ التعديلات بنجاح.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteListing(listingId);
      router.push("/my-listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing.");
    } finally {
      setDeleting(false);
    }
  }

  async function onLifecycleAction(
    action: "publish" | "unpublish" | "renew" | "expire"
  ): Promise<void> {
    setError(null);
    setSuccess(null);
    setStatusActionBusy(true);
    try {
      const updated =
        action === "publish"
          ? await publishListing(listingId)
          : action === "unpublish"
            ? await unpublishListing(listingId)
            : action === "renew"
              ? await renewListing(listingId)
              : await expireListing(listingId);
      setListing(updated);
      setSuccess("تم تحديث حالة الإعلان بنجاح.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تنفيذ الإجراء.");
    } finally {
      setStatusActionBusy(false);
    }
  }

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل تعديل الإعلان...">
      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">جاري تحميل بيانات الإعلان...</p>
      ) : (
        <form
          onSubmit={onSave}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
        >
          {error ? (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {success}
            </p>
          ) : null}

          <label className="space-y-1">
            <span className="text-sm font-medium">عنوان الإعلان</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              disabled={saving || deleting}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">السعر</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              disabled={saving || deleting}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">الوصف</span>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              disabled={saving || deleting}
            />
          </label>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--chip)] p-3">
            <p className="text-sm font-medium text-[var(--text)]">
              الحالة الحالية: {listing?.status ?? "-"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => void onLifecycleAction("publish")} disabled={saving || deleting || statusActionBusy} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-60">نشر</button>
              <button type="button" onClick={() => void onLifecycleAction("unpublish")} disabled={saving || deleting || statusActionBusy} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 disabled:opacity-60">إلغاء النشر</button>
              <button type="button" onClick={() => void onLifecycleAction("renew")} disabled={saving || deleting || statusActionBusy} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 disabled:opacity-60">تجديد</button>
              <button type="button" onClick={() => void onLifecycleAction("expire")} disabled={saving || deleting || statusActionBusy} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60">إنهاء الصلاحية</button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">الصور</p>
            <ImageUpload listingId={listingId} onUploaded={() => setSuccess("تم رفع الصورة وربطها بالإعلان.")} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || deleting || statusActionBusy}
              className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-contrast)]"
            >
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={saving || deleting || statusActionBusy}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800"
            >
              {deleting ? "جاري الحذف..." : "حذف الإعلان"}
            </button>
          </div>
        </form>
      )}
    </RequireAuthGate>
  );
}
