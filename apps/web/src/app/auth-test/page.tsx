import type { Metadata } from "next";
import { AuthTestPanel } from "@/components/auth/AuthTestPanel";

export const metadata: Metadata = {
  title: "اختبار المصادقة | Sooqna",
  description: "اختبار التسجيل، الدخول، Google، وقراءة ملف المستخدم في Firestore",
};

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <AuthTestPanel />
    </div>
  );
}
