import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { AccountDashboard } from "@/components/me/AccountDashboard";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("حسابي", "لوحة حساب المستخدم داخل سوقنا.");

export default function MePage() {
  return (
    <PublicShell
      pageTitle="حسابي"
      pageDescription="إدارة إعلاناتك، المفضلة، والرسائل من لوحة واحدة."
    >
      {/* لوحة المطور (/dev-tools): تُعرَض فقط عندما يكون دور المستخدم ADMIN — انظر AccountDashboard */}
      <AccountDashboard />
    </PublicShell>
  );
}
