import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { SubmitListingPage } from "@/components/listings/SubmitListingPage";

export const metadata: Metadata = {
  title: "إضافة إعلان",
  description: "أضف إعلانًا جديدًا في سوقنا باستخدام واجهة React.",
};

export default function SubmitListingRoutePage() {
  return (
    <PublicShell
      pageTitle="أضف إعلانك"
      pageDescription="أنشئ إعلان جديد وارفع الصور باستخدام الباكند الحالي من Milestone 1."
    >
      <SubmitListingPage />
    </PublicShell>
  );
}
