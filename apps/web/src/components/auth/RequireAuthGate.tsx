"use client";

import { useEffect, useState, type ReactNode, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function RequireAuthGateInner({
  children,
  fallbackMessage = "جاري التحقق من الجلسة...",
}: {
  children: ReactNode;
  fallbackMessage?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentUser, loading } = useAuth();
  const [authInitTimedOut, setAuthInitTimedOut] = useState(false);
  const effectiveLoading = loading && !authInitTimedOut;

  useEffect(() => {
    if (!loading) {
      setAuthInitTimedOut(false);
      return undefined;
    }
    const timeout = window.setTimeout(() => {
      setAuthInitTimedOut(true);
    }, 8500);
    return () => window.clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if (effectiveLoading) return;
    if (currentUser) return;
    const nextPath = `${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
  }, [effectiveLoading, currentUser, pathname, searchParams, router]);

  if (effectiveLoading) {
    return <p className="text-sm text-[var(--text-muted)]">{fallbackMessage}</p>;
  }

  if (!currentUser) {
    return (
      <p className="text-sm text-[var(--text-muted)]">يتم تحويلك إلى تسجيل الدخول...</p>
    );
  }

  return <>{children}</>;
}

export function RequireAuthGate(props: {
  children: ReactNode;
  fallbackMessage?: string;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">{props.fallbackMessage || "جاري التحقق من الجلسة..."}</p>}>
      <RequireAuthGateInner fallbackMessage={props.fallbackMessage}>{props.children}</RequireAuthGateInner>
    </Suspense>
  );
}
