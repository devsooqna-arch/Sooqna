import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "نصائح الأمان",
  description: "تسوّق وبيع بأمان على سوقنا",
};

export default function SafetyPage() {
  return (
    <PublicShell pageTitle="نصائح الأمان" pageDescription="تسوّق بأمان مع سوقنا 🛡️">
      <article className="prose prose-lg max-w-3xl mx-auto text-[var(--text)] leading-relaxed space-y-6">
        <h2 className="text-xl font-bold">نصائح للمشترين</h2>
        <ul className="list-none space-y-2 text-[var(--text-muted)]">
          <li>✅ التقِ بالبائع في مكان عام ومضاء</li>
          <li>✅ تحقق من المنتج قبل الدفع</li>
          <li>✅ لا تدفع مسبقاً لأشخاص لا تعرفهم</li>
          <li>✅ استخدم وسائل الدفع الآمنة</li>
          <li>⚠️ احذر من الأسعار المنخفضة بشكل مبالغ فيه</li>
        </ul>
        <h2 className="text-xl font-bold">نصائح للبائعين</h2>
        <ul className="list-none space-y-2 text-[var(--text-muted)]">
          <li>✅ اذكر تفاصيل المنتج بصدق</li>
          <li>✅ التقِ بالمشتري في مكان آمن</li>
          <li>✅ لا تشارك معلوماتك البنكية إلا عبر قنوات موثوقة</li>
          <li>⚠️ احذر من شيكات أو حوالات من مجهولين</li>
        </ul>
        <p className="text-[var(--text-muted)]">
          إذا صادفت احتيالاً: أبلغ عن الإعلان فوراً عبر زر «الإبلاغ عن الإعلان» أو راسلنا على{" "}
          <a href="mailto:safety@sooqna.com" className="text-[var(--brand)] hover:underline">
            safety@sooqna.com
          </a>
        </p>
      </article>
    </PublicShell>
  );
}
