"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreUserDoc } from "@/hooks/useFirestoreUserDoc";

const AFTER_LOGIN_PATH = "/me";

function authFields(user: User) {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    emailVerified: user.emailVerified,
    photoURL: user.photoURL,
  };
}

function formatFirestoreForDisplay(data: Record<string, unknown> | null) {
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

export function UserSessionPage() {
  const router = useRouter();
  const { currentUser, loading, logout } = useAuth();
  const firestore = useFirestoreUserDoc(currentUser?.uid);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace(`/login?next=${encodeURIComponent(AFTER_LOGIN_PATH)}`);
    }
  }, [loading, currentUser, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-500">جاري التحميل…</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-500">جاري التوجيه لتسجيل الدخول…</p>
      </div>
    );
  }

  const fsDisplay = formatFirestoreForDisplay(firestore.data);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8">
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold text-slate-900">بيانات حسابك</h1>
        <p className="mt-1 text-sm text-slate-500">
          معلومات من Firebase Auth ومستند Firestore
        </p>
      </div>

      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">
          Firebase Authentication
        </h2>
        <dl className="space-y-2 text-sm">
          {Object.entries(authFields(currentUser)).map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[7.5rem_1fr] gap-2 border-b border-slate-100 py-1.5 last:border-0 sm:grid-cols-[9rem_1fr]"
            >
              <dt className="font-mono text-xs text-slate-500">{k}</dt>
              <dd className="break-all text-slate-900">
                {typeof v === "boolean" ? String(v) : (v ?? "—")}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Firestore — users/{currentUser.uid}
          </h2>
          {firestore.loading ? (
            <span className="text-xs text-slate-400">جاري الجلب…</span>
          ) : firestore.exists ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
              موجود
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
              غير موجود بعد
            </span>
          )}
        </div>
        {firestore.error && (
          <p className="mb-3 text-xs text-red-600">{firestore.error.message}</p>
        )}
        {fsDisplay ? (
          <dl className="space-y-2 text-sm">
            {Object.entries(fsDisplay).map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[7.5rem_1fr] gap-2 border-b border-slate-100 py-1.5 last:border-0 sm:grid-cols-[9rem_1fr]"
              >
                <dt className="font-mono text-xs text-slate-500">{k}</dt>
                <dd className="break-all text-slate-900">
                  {v === null || v === undefined ? "—" : String(v)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-slate-500">
            لا يوجد مستند بعد — سيتم إنشاؤه تلقائياً بعد تسجيل الدخول.
          </p>
        )}
      </section>

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => void logout().then(() => router.replace("/login"))}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-900 hover:bg-red-100 sm:w-auto"
        >
          تسجيل الخروج
        </button>
        <Link
          href="/"
          className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-800 hover:bg-slate-50 sm:w-auto"
        >
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
