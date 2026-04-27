"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { deleteListing, getListingById, updateListing } from "@/services/listingService";

export function EditListingPageView({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");

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
        setTitle(item.title);
        setPrice(String(item.price));
        setDescription(item.description || "");
        setStatus(item.status);
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
      await updateListing(listingId, {
        title: title.trim(),
        price: parsedPrice,
        description: description.trim(),
        status: status as "draft" | "pending" | "published" | "rejected" | "sold" | "archived",
      });
      router.push(`/listings/${listingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteListing(listingId);
      router.push("/my-listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing.");
    } finally {
      setDeleting(false);
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

          <label className="space-y-1">
            <span className="text-sm font-medium">الحالة</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              disabled={saving || deleting}
            >
              <option value="draft">draft</option>
              <option value="pending">pending</option>
              <option value="published">published</option>
              <option value="rejected">rejected</option>
              <option value="sold">sold</option>
              <option value="archived">archived</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || deleting}
              className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-contrast)]"
            >
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={saving || deleting}
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
