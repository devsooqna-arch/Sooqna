import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export default function ListingNotFound() {
  return (
    <PublicShell>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-20 text-center shadow-[var(--shadow-sm)]">
        <p className="mb-4 text-6xl leading-none" aria-hidden>
          🔍
        </p>
        <h2 className="text-xl font-extrabold text-[var(--text)] sm:text-2xl">
          الإعلان غير موجود أو تم حذفه
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-muted)]">
          ربما تمت إزالة الإعلان أو انتهت صلاحيته. تصفّح الإعلانات الحالية أو ارجع للصفحة الرئيسية.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/listings"
            className="inline-flex rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-contrast)] shadow transition hover:opacity-90"
          >
            تصفّح إعلانات مشابهة
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--chip)] px-6 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--brand)]"
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
