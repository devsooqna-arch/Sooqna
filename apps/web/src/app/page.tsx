import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { HomeMarketplace } from "@/components/home/HomeMarketplace";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildAbsoluteUrl, buildPublicPageMetadata, seoDefaults } from "@/lib/seo";

export const metadata: Metadata = buildPublicPageMetadata({
  title: "سوقنا — سوقك في سوريا",
  description: seoDefaults.description,
  pathname: "/",
});

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "سوقنا",
        url: buildAbsoluteUrl("/"),
        logo: buildAbsoluteUrl("/branding/logo.png"),
      },
      {
        "@type": "WebSite",
        name: "سوقنا",
        url: buildAbsoluteUrl("/"),
        potentialAction: {
          "@type": "SearchAction",
          target: `${buildAbsoluteUrl("/listings")}?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <PublicShell>
      <JsonLdScript data={jsonLd} />
      <HomeMarketplace />
    </PublicShell>
  );
}
