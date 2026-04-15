"use client";

import { useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreUserDoc } from "@/hooks/useFirestoreUserDoc";
import { getAuthErrorMessage } from "@/services/authService";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Spec: uid, displayName, email, emailVerified, photoURL */
function pickAuthUserFields(user: User) {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    emailVerified: user.emailVerified,
    photoURL: user.photoURL,
  };
}

/** Spec fields from Firestore users/{uid} with readable timestamps */
function pickFirestoreProfileFields(data: Record<string, unknown> | null) {
  if (!data) return null;
  const keys = [
    "uid",
    "fullName",
    "email",
    "photoURL",
    "role",
    "accountStatus",
    "isEmailVerified",
    "createdAt",
    "updatedAt",
  ] as const;

  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const v = data[k];
    if (v instanceof Timestamp) {
      out[k] = v.toDate().toISOString();
    } else if (v && typeof v === "object" && "seconds" in v) {
      const s = (v as { seconds: number }).seconds;
      out[k] = new Date(s * 1000).toISOString();
    } else {
      out[k] = v ?? null;
    }
  }
  return out;
}

export function AuthTestPanel() {
  const {
    currentUser,
    loading: authLoading,
    register,
    login,
    loginWithGoogle,
    logout,
  } = useAuth();

  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [busy, setBusy] = useState<
    null | "signup" | "login" | "google" | "logout"
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firestore = useFirestoreUserDoc(currentUser?.uid);

  const authDisplay = useMemo(
    () => (currentUser ? pickAuthUserFields(currentUser) : null),
    [currentUser]
  );

  const firestoreDisplay = useMemo(
    () => pickFirestoreProfileFields(firestore.data),
    [firestore.data]
  );

  function validateSignUp(): boolean {
    if (!signupFullName.trim()) {
      setError("الاسم الكامل مطلوب لإنشاء الحساب.");
      return false;
    }
    if (!signupEmail.trim()) {
      setError("البريد الإلكتروني مطلوب.");
      return false;
    }
    if (!isValidEmail(signupEmail)) {
      setError("صيغة البريد غير صالحة.");
      return false;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return false;
    }
    return true;
  }

  function validateLogin(): boolean {
    if (!loginEmail.trim()) {
      setError("أدخل البريد الإلكتروني لتسجيل الدخول.");
      return false;
    }
    if (!isValidEmail(loginEmail)) {
      setError("صيغة البريد غير صالحة.");
      return false;
    }
    if (!loginPassword) {
      setError("أدخل كلمة المرور.");
      return false;
    }
    return true;
  }

  async function handleSignUp() {
    setError(null);
    setMessage(null);
    if (!validateSignUp()) return;
    setBusy("signup");
    try {
      await register(signupEmail, signupPassword, signupFullName);
      setMessage("تم إنشاء الحساب، وتحديث الملف في Firestore.");
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleLogin() {
    setError(null);
    setMessage(null);
    if (!validateLogin()) return;
    setBusy("login");
    try {
      await login(loginEmail, loginPassword);
      setMessage("تم تسجيل الدخول وتحديث الملف في Firestore.");
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleGoogle() {
    setError(null);
    setMessage(null);
    setBusy("google");
    try {
      await loginWithGoogle();
      setMessage("تم تسجيل الدخول بـ Google وتحديث الملف في Firestore.");
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleLogout() {
    setError(null);
    setMessage(null);
    setBusy("logout");
    try {
      await logout();
      setMessage("تم تسجيل الخروج.");
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null || authLoading;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          اختبار المصادقة — /auth-test
        </h1>
        <p className="text-sm text-slate-600">
          نماذج منفصلة للتسجيل والدخول، Google بالـ popup، وعرض بيانات Auth وFirestore.
        </p>
        <a
          href="/"
          className="inline-block text-sm font-medium text-slate-700 underline hover:text-slate-900"
        >
          ← الرئيسية
        </a>
      </header>

      {message && (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          {message}
        </div>
      )}
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            إنشاء حساب (Sign up)
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                الاسم الكامل (fullName)
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={signupFullName}
                onChange={(e) => setSignupFullName(e.target.value)}
                autoComplete="name"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                البريد (email)
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                autoComplete="email"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                كلمة المرور (password)
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                autoComplete="new-password"
                disabled={disabled}
              />
            </div>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={disabled}
              className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {busy === "signup" ? "جاري إنشاء الحساب…" : "إنشاء حساب"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            تسجيل الدخول (Login)
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                البريد (email)
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="email"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                كلمة المرور (password)
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="current-password"
                disabled={disabled}
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={disabled}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            >
              {busy === "login" ? "جاري تسجيل الدخول…" : "تسجيل الدخول"}
            </button>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-medium text-slate-700">Google (تحويل)</span>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={disabled}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "google" ? "جاري التوجيه…" : "تسجيل الدخول بـ Google"}
          </button>
        </div>
        {currentUser && (
          <button
            type="button"
            onClick={handleLogout}
            disabled={disabled}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
          >
            {busy === "logout" ? "جاري الخروج…" : "تسجيل الخروج"}
          </button>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">بيانات المستخدم بعد المصادقة</h2>
        {authLoading ? (
          <p className="text-sm text-slate-500">جاري تحميل حالة المصادقة…</p>
        ) : !currentUser ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            لا يوجد مستخدم مسجّل. استخدم نماذج التسجيل أو الدخول أعلاه.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                A) Firebase Auth User
              </h3>
              <dl className="space-y-2 text-sm">
                {authDisplay &&
                  Object.entries(authDisplay).map(([k, v]) => (
                    <div
                      key={k}
                      className="grid grid-cols-[8rem_1fr] gap-2 border-b border-slate-100 py-1 last:border-0"
                    >
                      <dt className="font-mono text-xs text-slate-500">{k}</dt>
                      <dd className="break-all text-slate-900">
                        {typeof v === "boolean" ? String(v) : (v ?? "—")}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                B) Firestore User Document — users/{currentUser.uid}
              </h3>
              {firestore.loading ? (
                <p className="text-sm text-slate-500">جاري جلب المستند…</p>
              ) : firestore.error ? (
                <p className="text-sm text-red-600">{firestore.error.message}</p>
              ) : !firestore.exists ? (
                <p className="text-sm text-amber-800">
                  لا يوجد مستند بعد. بعد الضغط على تسجيل/دخول يجب أن يُنشأ عبر{" "}
                  <code className="rounded bg-slate-100 px-1">ensureUserProfile</code>.
                </p>
              ) : (
                <dl className="space-y-2 text-sm">
                  {firestoreDisplay &&
                    Object.entries(firestoreDisplay).map(([k, v]) => (
                      <div
                        key={k}
                        className="grid grid-cols-[8rem_1fr] gap-2 border-b border-slate-100 py-1 last:border-0"
                      >
                        <dt className="font-mono text-xs text-slate-500">{k}</dt>
                        <dd className="break-all text-slate-900">
                          {v === null || v === undefined ? "—" : String(v)}
                        </dd>
                      </div>
                    ))}
                </dl>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
