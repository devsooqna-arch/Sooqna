import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { PublicListingsPage, ListingsPageSkeleton } from "@/components/listings/PublicListingsPage";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "الإعلانات",
  description: "تصفح جميع الإعلانات مع الفلترة حسب التصنيف.",
  alternates: {
    canonical: "/listings",
  },
};

export default function ListingsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "إعلانات سوقنا",
    url: buildAbsoluteUrl("/listings"),
  };

  return (
    <PublicShell>
      <JsonLdScript data={jsonLd} />
      <Suspense fallback={<ListingsPageSkeleton />}>
        <PublicListingsPage />
      </Suspense>
    </PublicShell>
  );
}
