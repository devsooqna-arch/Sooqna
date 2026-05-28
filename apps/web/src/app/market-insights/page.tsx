import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { MarketInsightsPage } from "@/components/market/MarketInsightsPage";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicPageMetadata({
  title: "إحصائيات السوق",
  description: "اكتشف أكثر المدن والتصنيفات نشاطاً ومتوسطات الأسعار في سوقنا.",
  pathname: "/market-insights",
});

export default function MarketInsightsRoute() {
  return (
    <PublicShell
      pageTitle="إحصائيات السوق"
      pageDescription="نظرة سريعة على نشاط الإعلانات المنشورة حسب المدن والتصنيفات."
    >
      <MarketInsightsPage />
    </PublicShell>
  );
}
