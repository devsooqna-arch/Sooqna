import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "تسجيل الدخول إلى سوقنا",
};

export default function LoginPage() {
  return (
    <AuthPageShell activeTab="login">
      <LoginForm mode="login" />
    </AuthPageShell>
  );
}
