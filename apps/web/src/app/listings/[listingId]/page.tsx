import type { Metadata } from "next";
import { ListingDetailsView } from "@/components/listings/ListingDetailsView";
import { PublicShell } from "@/components/layout/PublicShell";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildAbsoluteUrl } from "@/lib/seo";
import { fetchPublicListingById } from "@/lib/server-listings";

type ListingDetailsPageProps = {
  params: Promise<{ listingId: string }>;
};

export async function generateMetadata({
  params,
}: ListingDetailsPageProps): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await fetchPublicListingById(listingId);
  const title = listing?.title ? `${listing.title} | سوقنا` : `تفاصيل الإعلان | ${listingId}`;
  const description =
    listing?.description?.trim() ||
    "تفاصيل الإعلان داخل سوقنا، مع بيانات البائع وطرق التواصل المباشر.";

  return {
    title,
    description,
    alternates: {
      canonical: `/listings/${listingId}`,
    },
    openGraph: {
      title,
      description,
      url: `/listings/${listingId}`,
      images: listing?.images?.[0]?.url ? [listing.images[0].url] : undefined,
      type: "website",
    },
  };
}

export default async function ListingDetailsPage({ params }: ListingDetailsPageProps) {
  const { listingId } = await params;
  const listing = await fetchPublicListingById(listingId);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing?.title || `Listing ${listingId}`,
    sku: listingId,
    url: buildAbsoluteUrl(`/listings/${listingId}`),
    image: listing?.images?.[0]?.url || undefined,
    description: listing?.description || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: listing?.currency || "JOD",
      price: listing?.price ?? undefined,
      availability: "https://schema.org/InStock",
      url: buildAbsoluteUrl(`/listings/${listingId}`),
    },
    brand: {
      "@type": "Brand",
      name: "Sooqna",
    },
  };

  return (
    <PublicShell>
      <JsonLdScript data={jsonLd} />
      <ListingDetailsView listingId={listingId} />
    </PublicShell>
  );
}
