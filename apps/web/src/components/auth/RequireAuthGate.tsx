"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuthGate({
  children,
  fallbackMessage = "جاري التحقق من الجلسة...",
  redirectDelayMs = 1500,
}: {
  children: ReactNode;
  fallbackMessage?: string;
  redirectDelayMs?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser, loading } = useAuth();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (currentUser || redirectedRef.current) return;

    const nextPath = `${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    const redirectToLogin = () => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    };

    if (!loading) {
      redirectToLogin();
      return;
    }

    // If auth init is slow, do not leave protected pages hanging.
    const timeout = window.setTimeout(() => {
      if (!currentUser) {
        redirectToLogin();
      }
    }, redirectDelayMs);

    return () => window.clearTimeout(timeout);
  }, [loading, currentUser, pathname, searchParams, router, redirectDelayMs]);

  if (loading || !currentUser) {
    return <p className="text-sm text-[var(--text-muted)]">{fallbackMessage}</p>;
  }

  return <>{children}</>;
}
