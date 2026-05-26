"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { RequireAuthGate } from "@/components/auth/RequireAuthGate";
import { useAuth } from "@/hooks/useAuth";
import { getBackendMe, type BackendProfile } from "@/services/backendAuthService";

export function RequireAdminGate({ children }: { children: ReactNode }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoadingProfile(false);
      setProfile(null);
      return;
    }
    let mounted = true;
    setLoadingProfile(true);
    setError(null);
    void getBackendMe()
      .then((result) => {
        if (!mounted) return;
        setProfile(result);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "تعذر التحقق من صلاحيات الإدارة.");
      })
      .finally(() => {
        if (mounted) setLoadingProfile(false);
      });
    return () => {
      mounted = false;
    };
  }, [authLoading, currentUser]);

  return (
    <RequireAuthGate fallbackMessage="جاري التحقق من الجلسة...">
      {authLoading || loadingProfile ? (
        <AdminState title="جاري التحقق من الصلاحيات" message="لن يتم عرض بيانات الإدارة قبل تأكيد الدور من الخادم." />
      ) : error ? (
        <AdminState title="تعذر تحميل الصلاحيات" message={error} tone="error" />
      ) : profile?.role !== "ADMIN" ? (
        <AdminState
          title="غير مصرح"
          message="هذه الصفحة متاحة فقط لفريق الإدارة المصرح له."
          action={<Link className="text-sm font-semibold text-[var(--brand)] underline" href="/me">العودة إلى الحساب</Link>}
          tone="error"
        />
      ) : (
        children
      )}
    </RequireAuthGate>
  );
}

function AdminState({
  title,
  message,
  action,
  tone = "neutral",
}: {
  title: string;
  message: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
}) {
  return (
    <div className={`rounded-lg border p-5 ${tone === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"}`}>
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-1 text-sm opacity-80">{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
