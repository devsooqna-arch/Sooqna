"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getBackendMe, syncBackendProfile } from "@/services/backendAuthService";

export function AccountSettingsForm() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    void getBackendMe()
      .then((profile) => {
        if (!mounted) return;
        setFullName(profile?.fullName || currentUser.displayName || "");
        setPhotoURL(profile?.photoURL || currentUser.photoURL || "");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fullName.trim()) {
      setError("الاسم الكامل مطلوب.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await syncBackendProfile({
        fullName: fullName.trim(),
        photoURL: photoURL.trim() || undefined,
      });
      setSuccess("تم تحديث بيانات الحساب بنجاح.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل إعدادات الحساب...">
      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">جاري تحميل بيانات الحساب...</p>
      ) : (
        <form
          onSubmit={onSubmit}
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
            <span className="text-sm font-medium">الاسم الكامل</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              disabled={saving}
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">رابط الصورة الشخصية</span>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              disabled={saving}
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-contrast)] transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </form>
      )}
    </RequireAuthGate>
  );
}
