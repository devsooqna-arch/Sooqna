"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/services/apiClient";

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

function formatProfileForDisplay(data: Record<string, unknown> | null) {
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
    out[k] = v ?? null;
  }
  return out;
}

type SeedSummaryCounts = {
  users: number;
  categories: number;
  listings: number;
  favorites: number;
  conversations: number;
  messages: number;
};

export function UserSessionPage() {
  const router = useRouter();
  const { currentUser, loading, logout } = useAuth();
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [seedSummary, setSeedSummary] = useState<{
    source: "database" | "json-fallback";
    counts: SeedSummaryCounts;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace(`/login?next=${encodeURIComponent(AFTER_LOGIN_PATH)}`);
    }
  }, [loading, currentUser, router]);

  const profileDisplay = useMemo(() => formatProfileForDisplay(profileData), [profileData]);

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    setProfileLoading(true);
    setProfileError(null);
    void apiFetch<{ success: true; profile: Record<string, unknown> | null }>("/users/me", {
      authenticated: true,
    })
      .then((result) => {
        if (!mounted) return;
        setProfileData(result.profile);
      })
      .catch((e) => {
        if (!mounted) return;
        setProfileError(e instanceof Error ? e.message : "Failed to load profile.");
      })
      .finally(() => {
        if (!mounted) return;
        setProfileLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    setSummaryLoading(true);
    setSummaryError(null);
    void apiFetch<{
      success: true;
      source: "database" | "json-fallback";
      counts: SeedSummaryCounts;
    }>("/dev/seed-summary")
      .then((result) => {
        if (!mounted) return;
        setSeedSummary({
          source: result.source,
          counts: result.counts,
        });
      })
      .catch((error) => {
        if (!mounted) return;
        setSummaryError(error instanceof Error ? error.message : "Failed to load data summary.");
      })
      .finally(() => {
        if (!mounted) return;
        setSummaryLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currentUser]);

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8">
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold text-slate-900">بيانات حسابك</h1>
        <p className="mt-1 text-sm text-slate-500">
          معلومات من Firebase Auth وملف المستخدم من Backend
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
            Backend Profile — /api/users/me
          </h2>
          {profileLoading ? (
            <span className="text-xs text-slate-400">جاري الجلب…</span>
          ) : profileData ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
              موجود
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
              غير موجود بعد
            </span>
          )}
        </div>
        {profileError && (
          <p className="mb-3 text-xs text-red-600">{profileError}</p>
        )}
        {profileDisplay ? (
          <dl className="space-y-2 text-sm">
            {Object.entries(profileDisplay).map(([k, v]) => (
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
            لا يوجد ملف بعد — سيتم إنشاؤه تلقائياً بعد تسجيل الدخول.
          </p>
        )}
      </section>

      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">Dummy Data Summary</h2>
          {summaryLoading ? (
            <span className="text-xs text-slate-400">جاري الجلب…</span>
          ) : seedSummary ? (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-900">
              المصدر: {seedSummary.source === "database" ? "Database" : "JSON Fallback"}
            </span>
          ) : null}
        </div>
        {summaryError && <p className="mb-3 text-xs text-red-600">{summaryError}</p>}
        {seedSummary ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryCard label="Users" value={seedSummary.counts.users} />
            <SummaryCard label="Categories" value={seedSummary.counts.categories} />
            <SummaryCard label="Listings" value={seedSummary.counts.listings} />
            <SummaryCard label="Favorites" value={seedSummary.counts.favorites} />
            <SummaryCard label="Conversations" value={seedSummary.counts.conversations} />
            <SummaryCard label="Messages" value={seedSummary.counts.messages} />
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            لا يوجد ملخص بيانات بعد — سيتم جلبه تلقائيًا بعد تسجيل الدخول.
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
