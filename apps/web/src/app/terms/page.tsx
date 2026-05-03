import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description: "شروط استخدام منصة سوقنا",
};

export default function TermsPage() {
  return (
    <PublicShell pageTitle="شروط الاستخدام" pageDescription="آخر تحديث: مايو 2026">
      <article className="prose prose-lg max-w-3xl mx-auto text-[var(--text)] leading-relaxed space-y-6">
        <h2 className="text-xl font-bold">1. القبول بالشروط</h2>
        <p className="text-[var(--text-muted)]">
          باستخدامك لمنصة سوقنا، فإنك توافق على هذه الشروط كاملةً.
        </p>
        <h2 className="text-xl font-bold">2. استخدام المنصة</h2>
        <ul className="list-disc space-y-2 pe-6 text-[var(--text-muted)]">
          <li>يُسمح للمستخدمين بنشر إعلانات البيع والشراء المشروعة فقط</li>
          <li>يُحظر نشر محتوى مضلل أو مزيف أو ينتهك حقوق الآخرين</li>
          <li>يُحظر نشر منتجات مخالفة للقانون السوري المعمول به</li>
        </ul>
        <h2 className="text-xl font-bold">3. المسؤولية</h2>
        <p className="text-[var(--text-muted)]">
          سوقنا منصة وسيطة لا تتحمل مسؤولية الصفقات بين المستخدمين. ننصح دائماً بالتحقق من البائع واللقاء في أماكن عامة.
        </p>
        <h2 className="text-xl font-bold">4. الإعلانات</h2>
        <ul className="list-disc space-y-2 pe-6 text-[var(--text-muted)]">
          <li>كل مستخدم مسؤول عن دقة إعلاناته</li>
          <li>تحتفظ سوقنا بحق حذف أي إعلان يخالف السياسات</li>
          <li>الإعلانات المميزة مدفوعة وخاضعة لشروط إضافية</li>
        </ul>
        <h2 className="text-xl font-bold">5. الحساب</h2>
        <ul className="list-disc space-y-2 pe-6 text-[var(--text-muted)]">
          <li>أنت مسؤول عن سرية كلمة مرورك</li>
          <li>يحق لسوقنا تعليق الحسابات المخالفة</li>
        </ul>
        <h2 className="text-xl font-bold">6. التعديلات</h2>
        <p className="text-[var(--text-muted)]">
          نحتفظ بحق تعديل هذه الشروط في أي وقت مع إشعار المستخدمين.
        </p>
        <p className="text-[var(--text-muted)]">
          للاستفسار:{" "}
          <a href="mailto:legal@sooqna.com" className="text-[var(--brand)] hover:underline">
            legal@sooqna.com
          </a>
        </p>
      </article>
    </PublicShell>
  );
}
