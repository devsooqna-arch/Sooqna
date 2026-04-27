"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function PublicNavActions() {
  const router = useRouter();
  const { currentUser, loading, logout } = useAuth();

  if (loading) {
    return <span className="text-xs text-[var(--text-muted)]">...</span>;
  }

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full bg-[var(--brand)] px-5 py-2 text-xs font-semibold text-[var(--brand-contrast)] transition hover:opacity-90"
        >
          تسجيل الدخول
        </Link>
        <span className="text-xs text-[var(--text-muted)]">أو</span>
        <Link
          href="/register"
          className="rounded-full border border-[var(--chip-border)] bg-[var(--surface)] px-5 py-2 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--chip)]"
        >
          إنشاء حساب
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/me"
        className="rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-[var(--brand-contrast)] transition hover:opacity-90"
      >
        حسابي
      </Link>
      <button
        type="button"
        onClick={() =>
          void logout().then(() => {
            router.replace("/");
          })
        }
        className="rounded-full border border-[var(--chip-border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--chip)]"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
