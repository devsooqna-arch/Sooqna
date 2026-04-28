import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { HomeMarketplace } from "@/components/home/HomeMarketplace";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "سوقنا | الصفحة الرئيسية",
  description: "منصة سوقنا للتصنيفات والإعلانات المبوبة.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "سوقنا",
    url: buildAbsoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${buildAbsoluteUrl("/listings")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <PublicShell>
      <JsonLdScript data={jsonLd} />
      <HomeMarketplace />
    </PublicShell>
  );
}
