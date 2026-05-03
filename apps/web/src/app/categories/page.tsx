import type { Metadata } from "next";
import { CategoriesDirectory } from "@/components/categories/CategoriesDirectory";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "التصنيفات",
  description: "تصفح التصنيفات المتاحة للوصول إلى الإعلانات المناسبة.",
};

export default function CategoriesPage() {
  return (
    <PublicShell
      pageTitle="التصنيفات"
      pageDescription="اختر التصنيف المناسب وانتقل مباشرة إلى الإعلانات ذات الصلة."
    >
      <CategoriesDirectory />
    </PublicShell>
  );
}
