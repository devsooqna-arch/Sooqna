"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")
      ? "text-[var(--brand)]"
      : "text-[var(--text-muted)]";

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-[var(--nav-bottom-border)] bg-[var(--nav-bottom)] pb-[env(safe-area-inset-bottom)] md:hidden">
      {/* بحث */}
      <Link href="/listings" className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium ${active("/listings")}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        بحث
      </Link>

      {/* المفضلة */}
      <Link href="/favorites" className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium ${active("/favorites")}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        المفضلة
      </Link>

      {/* أضف إعلان — center big */}
      <Link
        href="/submit-listing"
        className="relative -top-3 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-contrast)] shadow-lg"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span className="text-[9px] font-bold leading-tight">أعلن</span>
      </Link>

      {/* رسائل */}
      <Link href="/messages" className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium ${active("/messages")}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        رسائل
      </Link>

      {/* حساب */}
      <Link
        href={currentUser ? "/me" : "/login"}
        className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium ${active("/me")}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        حسابي
      </Link>
    </nav>
  );
}
