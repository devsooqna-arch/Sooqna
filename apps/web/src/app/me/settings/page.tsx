import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { AccountSettingsForm } from "@/components/me/AccountSettingsForm";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("إعدادات الحساب", "الملف الشخصي، الأمان، والاختصارات في سوقنا.");

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
