import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("استعادة كلمة المرور", "استرجاع الوصول إلى حسابك في سوقنا.");

export default function ResetPasswordPage() {
  return (
    <AuthPageShell activeTab="login">
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
