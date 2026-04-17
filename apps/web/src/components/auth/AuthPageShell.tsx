"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type AuthPageShellProps = {
  activeTab: "login" | "register";
  children: ReactNode;
};

export function AuthPageShell({ activeTab, children }: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.15),transparent_40%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-stretch overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-slate-900/30 lg:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
              Sooqna Marketplace
            </span>
            <h2 className="text-3xl font-bold leading-tight">
              سوقنا
              <br />
              أسرع طريقة للبيع والشراء بثقة
            </h2>
            <p className="max-w-md text-sm text-slate-300">
              سجّل الدخول أو أنشئ حساب جديد لتبدأ عرض المنتجات، متابعة الرسائل،
              وإدارة كل نشاطك من مكان واحد.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-200">
            <FeatureBullet text="تسجيل سريع عبر Google أو البريد الإلكتروني" />
            <FeatureBullet text="حساب موحّد لإدارة الإعلانات والمحادثات" />
            <FeatureBullet text="تجربة آمنة وسهلة على الجوال والويب" />
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 p-5 sm:p-8 lg:p-10">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wide text-slate-900">
                مرحبًا بك
              </span>
              <span className="text-xs text-slate-500">Sooqna</span>
            </div>

            <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1 text-sm">
              <Link
                href="/login"
                className={`rounded-lg px-4 py-2 text-center font-medium transition ${
                  activeTab === "login"
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className={`rounded-lg px-4 py-2 text-center font-medium transition ${
                  activeTab === "register"
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                إنشاء حساب
              </Link>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureBullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-cyan-400" />
      <p>{text}</p>
    </div>
  );
}
