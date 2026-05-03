import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { AccountSettingsForm } from "@/components/me/AccountSettingsForm";

export const metadata: Metadata = {
  title: "إعدادات الحساب",
  description: "الملف الشخصي، الأمان، والاختصارات في سوقنا.",
  alternates: {
    canonical: "/me/settings",
  },
};

export default function AccountSettingsPage() {
  return (
    <PublicShell
      pageTitle="إعدادات الحساب"
      pageDescription="الملف الشخصي، البريد، الأمان، واختصارات الحساب."
    >
      <AccountSettingsForm />
    </PublicShell>
  );
}
