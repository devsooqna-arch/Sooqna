import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("تسجيل الدخول", "تسجيل الدخول إلى سوقنا");

export default function LoginPage() {
  return (
    <AuthPageShell activeTab="login">
      <LoginForm mode="login" />
    </AuthPageShell>
  );
}
