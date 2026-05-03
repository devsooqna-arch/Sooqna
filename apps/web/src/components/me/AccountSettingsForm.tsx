"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { getBackendMe, syncBackendProfile } from "@/services/backendAuthService";
import { uploadBackendProfileAvatar } from "@/services/backendUploadService";
import { getAuthErrorMessage, sendPasswordResetLink } from "@/services/authService";
import { ModernAvatar } from "@/components/ui/ModernAvatar";

export function AccountSettingsForm() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  /** يُحدَّث تلقائياً من السيرفر أو الرفع أو صورة جوجل — لا يُحرَّر يدوياً كحقل نص */
  const [photoURL, setPhotoURL] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  const previewUrl = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const hasEmailPasswordProvider = Boolean(
    currentUser?.providerData?.some((p) => p.providerId === "password")
  );

  const hasGooglePhoto = Boolean(currentUser?.photoURL?.trim());

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

  function applyGooglePhoto() {
    if (!currentUser?.photoURL) return;
    setPhotoURL(currentUser.photoURL);
    setAvatarFile(null);
    setSuccess(null);
    setError(null);
  }

  async function handleSendPasswordReset() {
    if (!currentUser?.email || !hasEmailPasswordProvider) return;
    setResetSending(true);
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordResetLink(currentUser.email);
      setSuccess("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setResetSending(false);
    }
  }

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
      let nextPhotoURL = photoURL.trim() || undefined;
      if (avatarFile) {
        setUploadingAvatar(true);
        const uploaded = await uploadBackendProfileAvatar(avatarFile);
        nextPhotoURL = uploaded.avatarUrl;
      }

      await syncBackendProfile({
        fullName: fullName.trim(),
        photoURL: nextPhotoURL,
      });
      if (nextPhotoURL) {
        setPhotoURL(nextPhotoURL);
      }
      setAvatarFile(null);
      setSuccess("تم تحديث بيانات الحساب بنجاح.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  }

  const emailVerified = Boolean(currentUser?.emailVerified);

  return (
    <RequireAuthGate fallbackMessage="يتم التحقق من الجلسة قبل إعدادات الحساب...">
      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">جاري تحميل بيانات الحساب...</p>
      ) : (
        <div className="space-y-8">
          <form onSubmit={onSubmit} className="space-y-8">
            {error ? (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                {success}
              </p>
            ) : null}

            {/* الملف الشخصي */}
            <section className="ui-card space-y-4 p-5 sm:p-6">
              <div className="border-b border-[var(--border)] pb-3">
                <h2 className="text-lg font-bold text-[var(--text)]">الملف الشخصي</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  الاسم والصورة تظهر في إعلاناتك ومحادثاتك.
                </p>
              </div>

              <label className="space-y-1">
                <span className="text-sm font-medium">الاسم الكامل</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="ui-input w-full"
                  disabled={saving}
                  autoComplete="name"
                />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium">الصورة الشخصية</span>
                <p className="text-xs text-[var(--text-muted)]">
                  ارفع صورة من جهازك — يتم حفظ الرابط تلقائياً على الخادم دون إدخال يدوي لرابط.
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                  className="ui-input w-full file:mr-2 file:rounded-full file:border-0 file:bg-[var(--chip)] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[var(--text-muted)]"
                  disabled={saving}
                />
                {hasGooglePhoto ? (
                  <button
                    type="button"
                    onClick={applyGooglePhoto}
                    disabled={saving}
                    className="text-xs font-semibold text-[var(--brand)] hover:underline disabled:opacity-50"
                  >
                    استخدام صورة حساب جوجل الحالية
                  </button>
                ) : null}
              </div>

              {(previewUrl || photoURL) && (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                  <ModernAvatar src={previewUrl ?? photoURL} name={fullName || "المستخدم"} size="lg" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">
                      {previewUrl ? "معاينة قبل الحفظ" : "الصورة المحفوظة"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {previewUrl ? "اضغط حفظ الإعدادات لتأكيد الرفع." : "ستُستخدم في بطاقة حسابك وإعلاناتك."}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving || uploadingAvatar}
                className="ui-btn-primary w-full sm:w-auto"
              >
                {saving || uploadingAvatar ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </button>
            </section>
          </form>

          {/* الحساب */}
          <section className="ui-card space-y-4 p-5 sm:p-6">
            <div className="border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold text-[var(--text)]">الحساب</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">البريد مرتبط بتسجيل الدخول ولا يُغيَّر من هنا.</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)]">البريد الإلكتروني</p>
                <p className="font-medium text-[var(--text)]">{currentUser?.email ?? "—"}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  emailVerified
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                }`}
              >
                {emailVerified ? "بريد مؤكد" : "بريد غير مؤكد"}
              </span>
            </div>
          </section>

          {/* الأمان */}
          <section className="ui-card space-y-4 p-5 sm:p-6">
            <div className="border-b border-[var(--border)] pb-3">
              <h2 className="text-lg font-bold text-[var(--text)]">الأمان</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                إدارة كلمة المرور عبر البريد الإلكتروني (Firebase).
              </p>
            </div>
            {hasEmailPasswordProvider ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--text-muted)]">
                  نسيت كلمة المرور أو تريد تعييناً جديداً؟ نرسل لك رابطاً آمناً إلى بريدك.
                </p>
                <button
                  type="button"
                  onClick={() => void handleSendPasswordReset()}
                  disabled={resetSending || !currentUser?.email}
                  className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--chip)] px-5 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-50"
                >
                  {resetSending ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                تسجيل الدخول عبر جوجل أو مزوّد خارجي — لا تُدار كلمة المرور من هذه الصفحة.
              </p>
            )}
          </section>

          {/* روابط سريعة */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
            <h2 className="mb-3 text-sm font-bold text-[var(--text)]">اختصارات</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/my-listings" className="ui-chip px-4 py-2 text-xs font-semibold hover:border-[var(--brand)]">
                إعلاناتي
              </Link>
              <Link href="/favorites" className="ui-chip px-4 py-2 text-xs font-semibold hover:border-[var(--brand)]">
                المفضلة
              </Link>
              <Link href="/messages" className="ui-chip px-4 py-2 text-xs font-semibold hover:border-[var(--brand)]">
                الرسائل
              </Link>
              <Link href="/submit-listing" className="ui-chip px-4 py-2 text-xs font-semibold hover:border-[var(--brand)]">
                إضافة إعلان
              </Link>
            </div>
          </section>
        </div>
      )}
    </RequireAuthGate>
  );
}
