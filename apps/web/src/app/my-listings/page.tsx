import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { MyListingsPageView } from "@/components/listings/MyListingsPageView";

export const metadata: Metadata = {
  title: "إعلاناتي | سوقنا",
  description: "إدارة الإعلانات التي قمت بنشرها.",
};

export default function MyListingsPage() {
  return (
    <PublicShell
      pageTitle="إعلاناتي"
      pageDescription="راجع إعلاناتك الحالية وانتقل سريعًا لتعديل أي إعلان."
    >
      <MyListingsPageView />
    </PublicShell>
  );
}
