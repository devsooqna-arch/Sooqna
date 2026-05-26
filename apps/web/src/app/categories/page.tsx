import type { Metadata } from "next";
import { CategoriesDirectory } from "@/components/categories/CategoriesDirectory";
import { PublicShell } from "@/components/layout/PublicShell";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicPageMetadata({
  title: "التصنيفات",
  description: "استكشف تصنيفات سوقنا للوصول بسرعة إلى إعلانات السيارات والعقارات والإلكترونيات والخدمات وغيرها.",
  pathname: "/categories",
});

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
