import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف نجمع ونستخدم ونحمي بياناتك في سوقنا",
};

export default function PrivacyPage() {
  return (
    <PublicShell pageTitle="سياسة الخصوصية" pageDescription="آخر تحديث: مايو 2026">
      <article className="prose prose-lg max-w-3xl mx-auto text-[var(--text)] leading-relaxed space-y-6">
        <h2 className="text-xl font-bold">1. المعلومات التي نجمعها</h2>
        <ul className="list-disc space-y-2 pe-6 text-[var(--text-muted)]">
          <li>معلومات الحساب: الاسم، البريد الإلكتروني، الصورة الشخصية</li>
          <li>معلومات الإعلانات: العنوان، السعر، الوصف، الصور، الموقع</li>
          <li>بيانات الاستخدام: الصفحات المزارة، وقت الاستخدام</li>
        </ul>
        <h2 className="text-xl font-bold">2. كيف نستخدم المعلومات</h2>
        <ul className="list-disc space-y-2 pe-6 text-[var(--text-muted)]">
          <li>تشغيل وتحسين المنصة</li>
          <li>التواصل معك بخصوص حسابك وإعلاناتك</li>
          <li>منع الاحتيال وحماية المجتمع</li>
        </ul>
        <h2 className="text-xl font-bold">3. مشاركة المعلومات</h2>
        <p className="text-[var(--text-muted)]">
          لا نبيع بياناتك لأطراف ثالثة أبداً. نشارك فقط ما يظهر في إعلاناتك العامة مع المستخدمين الآخرين.
        </p>
        <h2 className="text-xl font-bold">4. الأمان</h2>
        <p className="text-[var(--text-muted)]">
          نستخدم Firebase Authentication وبروتوكول HTTPS لحماية بياناتك.
        </p>
        <h2 className="text-xl font-bold">5. حقوقك</h2>
        <ul className="list-disc space-y-2 pe-6 text-[var(--text-muted)]">
          <li>طلب حذف حسابك وبياناتك</li>
          <li>تصحيح معلوماتك الشخصية</li>
          <li>إلغاء الاشتراك في الإشعارات</li>
        </ul>
        <p className="text-[var(--text-muted)]">
          للاستفسار:{" "}
          <a href="mailto:privacy@sooqna.com" className="text-[var(--brand)] hover:underline">
            privacy@sooqna.com
          </a>
        </p>
      </article>
    </PublicShell>
  );
}
