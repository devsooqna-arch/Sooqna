import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { SubmitListingPage } from "@/components/listings/SubmitListingPage";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("إضافة إعلان", "أضف إعلانًا جديدًا في سوقنا.");

export default function SubmitListingRoutePage() {
  return (
    <PublicShell
      pageTitle="أضف إعلانك"
      pageDescription="انشر إعلانك مجاناً في ثوانٍ وابدأ البيع الآن."
    >
      <SubmitListingPage />
    </PublicShell>
  );
}
