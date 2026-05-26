import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("إنشاء حساب", "إنشاء حساب جديد في سوقنا");

export default function RegisterPage() {
  return (
    <AuthPageShell activeTab="register">
      <LoginForm mode="signup" />
    </AuthPageShell>
  );
}
