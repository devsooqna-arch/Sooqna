import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { AccountDashboard } from "@/components/me/AccountDashboard";

export const metadata: Metadata = {
  title: "حسابي",
  description: "لوحة حساب المستخدم داخل سوقنا.",
};

export default function MePage() {
  return (
    <PublicShell
      pageTitle="حسابي"
      pageDescription="إدارة الإعلانات، المفضلة، والرسائل باستخدام خدمات Milestone 1 الحالية."
    >
      <AccountDashboard />
    </PublicShell>
  );
}
