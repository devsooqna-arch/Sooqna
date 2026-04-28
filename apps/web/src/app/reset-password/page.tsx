import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور | سوقنا",
  description: "استرجاع الوصول إلى حسابك في سوقنا.",
};

export default function ResetPasswordPage() {
  return (
    <AuthPageShell activeTab="login">
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
