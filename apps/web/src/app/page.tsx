import Link from "next/link";
import { CategoriesList } from "@/components/test/CategoriesList";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Sooqna</h1>
      <p className="mt-2 text-slate-600">Next.js + Firebase (Milestone 1 foundation).</p>
      <p className="mt-4">
        <Link
          href="/auth-test"
          className="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700"
        >
          صفحة اختبار المصادقة والملف الشخصي →
        </Link>
      </p>
      <section className="mt-8 max-w-xl">
        <h2 className="text-lg font-medium text-slate-900">Categories (Test)</h2>
        <CategoriesList />
      </section>
    </main>
  );
}
