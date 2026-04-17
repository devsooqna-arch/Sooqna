import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "إنشاء حساب | Sooqna",
  description: "إنشاء حساب جديد في سوقنا",
};

export default function RegisterPage() {
  return (
    <AuthPageShell activeTab="register">
      <LoginForm mode="signup" />
    </AuthPageShell>
  );
}
