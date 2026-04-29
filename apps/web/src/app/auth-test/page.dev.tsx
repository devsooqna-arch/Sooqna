import type { Metadata } from "next";
import { AuthTestPanelNoSsr } from "@/components/auth/AuthTestPanelNoSsr";

export const metadata: Metadata = {
  title: "اختبار المصادقة | سوقنا",
  description: "اختبار التسجيل، الدخول، جوجل، وقراءة ملف المستخدم من الخادم الخلفي",
};

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <AuthTestPanelNoSsr />
    </div>
  );
}
