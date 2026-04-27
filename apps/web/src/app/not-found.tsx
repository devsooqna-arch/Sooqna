import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export default function NotFound() {
  return (
    <PublicShell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-8xl font-extrabold text-[var(--brand)]">404</p>
        <h1 className="text-2xl font-bold text-[var(--text)]">الصفحة غير موجودة</h1>
        <p className="max-w-sm text-sm text-[var(--text-muted)]">
          الرابط الذي زرته غير متاح أو ربما تم حذفه.
        </p>
        <Link
          href="/"
          className="rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-contrast)]"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </PublicShell>
  );
}
