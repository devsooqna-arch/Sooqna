import type { Metadata } from "next";
import { UserSessionPage } from "@/components/me/UserSessionPage";

export const metadata: Metadata = {
  title: "حسابي | Sooqna",
  description: "بيانات المستخدم من Firebase و Firestore",
};

export default function MePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <UserSessionPage />
    </div>
  );
}
