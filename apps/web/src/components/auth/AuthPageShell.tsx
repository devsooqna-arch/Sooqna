"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { BottomNav } from "@/components/layout/BottomNav";

type AuthPageShellProps = {
  activeTab: "login" | "register";
  children: ReactNode;
};

export function AuthPageShell({ activeTab, children }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Minimal header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[1110px] items-center justify-between px-4 py-2.5 sm:px-6">
          <Link href="/">
            <Image
              src="/branding/logo.png"
              alt="سوقنا"
              width={82}
              height={40}
              className="h-10 w-auto"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Centered form card */}
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col items-center justify-center px-4 py-10">
        {/* Tab switcher */}
        <div className="mb-6 flex w-full overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)]">
          <Link
            href="/login"
            className={`flex-1 py-2.5 text-center text-sm font-semibold transition ${
              activeTab === "login"
                ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className={`flex-1 py-2.5 text-center text-sm font-semibold transition ${
              activeTab === "register"
                ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            حساب جديد
          </Link>
        </div>

        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]">
          {children}
        </div>

        {/* Security note */}
        <p className="mt-5 flex items-center gap-1.5 text-center text-xs text-[var(--text-muted)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          بياناتك محمية وآمنة — نستخدم تشفير الاتصال لحماية معلوماتك
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
