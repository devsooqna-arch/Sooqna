"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getBackendMe, type BackendProfile } from "@/services/backendAuthService";
import { canShowAdminNav } from "@/components/layout/adminNavState";

export function AdminNavLink() {
  const { currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<BackendProfile | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setProfile(null);
      return;
    }

    let mounted = true;
    void getBackendMe()
      .then((nextProfile) => {
        if (mounted) setProfile(nextProfile);
      })
      .catch(() => {
        if (mounted) setProfile(null);
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, currentUser]);

  if (!canShowAdminNav(profile)) return null;

  return (
    <Link
      href="/admin"
      aria-label="لوحة الإدارة"
      title="لوحة الإدارة"
      className="inline-flex h-10 w-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--brand)] bg-[var(--surface)] text-xs font-bold text-[var(--brand)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--brand)] hover:text-[var(--brand-contrast)] sm:w-auto sm:px-4"
    >
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
      <span className="hidden whitespace-nowrap sm:inline">لوحة الإدارة</span>
    </Link>
  );
}
