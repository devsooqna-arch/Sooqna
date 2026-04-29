import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { PublicNavActions } from "@/components/layout/PublicNavActions";
import { SearchBar } from "@/components/layout/SearchBar";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { BottomNav } from "@/components/layout/BottomNav";

export function PublicShell({
  children,
  pageTitle,
  pageDescription,
}: {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30">
        <div className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-[1110px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
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

            <div className="hidden items-center gap-2 md:flex">
              <ThemeSwitcher />
              <PublicNavActions />
            </div>
          </div>
        </div>

        <div className="border-b border-[var(--accent-strip)] bg-[var(--accent-strip)]">
          <div className="mx-auto flex max-w-[1110px] items-center gap-3 px-4 py-2 sm:px-6">
            <Link
              href="/submit-listing"
              className="ui-btn-primary rounded-full px-5"
            >
              + أعلن
            </Link>

            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
        </div>

        <div className="border-b border-[var(--border)] bg-[var(--surface)] md:hidden">
          <div className="mx-auto flex max-w-[1110px] items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6">
            <ThemeSwitcher />
            <PublicNavActions />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1110px] px-4 py-7 pb-24 sm:px-6 md:pb-7">
        {pageTitle ? (
          <section className="mb-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl" style={{ lineHeight: 1.25 }}>
              {pageTitle}
            </h1>
            {pageDescription ? (
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">{pageDescription}</p>
            ) : null}
          </section>
        ) : null}
        {children}
      </main>

      <BottomNav />

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[1110px] px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-5">
            <FooterColumn
              title="عن سوقنا"
              items={[
                { label: "من نحن", href: "/about" },
                { label: "الوظائف", href: "#" },
                { label: "المركز الإعلامي", href: "#" },
                { label: "التطبيقات", href: "#" },
                { label: "اتصل بنا", href: "/contact" },
              ]}
            />
            <FooterColumn
              title="معلومات"
              items={[
                { label: "المساعدة", href: "#" },
                { label: "نصائح الأمان", href: "#" },
                { label: "سياسة الخصوصية", href: "#" },
                { label: "شروط الاستخدام", href: "/terms" },
              ]}
            />
            <FooterColumn
              title="للشركات"
              items={[
                { label: "الإعلان معنا", href: "#" },
                { label: "الباقات الإعلانية", href: "#" },
                { label: "حلول الشركات", href: "#" },
              ]}
            />
            <FooterColumn
              title="عام"
              items={[
                { label: "عمليات البحث الشائعة", href: "/listings" },
                { label: "عرض التصنيفات", href: "/categories" },
                { label: "إضافة إعلان", href: "/submit-listing" },
              ]}
            />
            <div>
              <h3 className="mb-4 text-base font-bold">التواصل الاجتماعي</h3>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--chip-border)] bg-[var(--surface-muted)] text-xs shadow-[var(--shadow-sm)]">f</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--chip-border)] bg-[var(--surface-muted)] text-xs shadow-[var(--shadow-sm)]">in</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--chip-border)] bg-[var(--surface-muted)] text-xs shadow-[var(--shadow-sm)]">▶</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--chip-border)] bg-[var(--surface-muted)] text-xs shadow-[var(--shadow-sm)]">◎</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--border)] pt-5">
            <p className="mb-3 text-sm font-semibold">التصنيفات</p>
            <div className="flex flex-wrap gap-2">
              {["أخرى", "وظائف", "عقارات", "سيارات", "موبايلات", "أثاث", "مستلزمات الأطفال"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="ui-chip px-4 py-1.5"
                  >
                    {chip}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <p>جميع الحقوق محفوظة © 2026 سوقنا</p>
            <ScrollToTopButton />
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-bold">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--brand)]">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

