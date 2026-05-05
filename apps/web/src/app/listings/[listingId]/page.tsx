import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailsView } from "@/components/listings/ListingDetailsView";
import { PublicShell } from "@/components/layout/PublicShell";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { listingTitleForPageMetadata } from "@/lib/listingMetadata";
import { resolvePublicMediaUrl } from "@/lib/mediaUrl";
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
  const description =
    listing?.description?.trim() ||
    "تفاصيل الإعلان داخل سوقنا، مع بيانات البائع وطرق التواصل المباشر.";

  if (!listing) {
    const title = "إعلان غير موجود";
    return {
      title,
      description: "لم يُعثر على هذا الإعلان في سوقنا.",
      alternates: { canonical: `/listings/${listingId}` },
      openGraph: {
        title,
        description: "لم يُعثر على هذا الإعلان في سوقنا.",
        url: `/listings/${listingId}`,
        type: "website",
      },
    };
  }

  const title = listingTitleForPageMetadata(listing.title);

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
      images: listing.images?.[0]?.url
        ? [(resolvePublicMediaUrl(listing.images[0].url) ?? listing.images[0].url)]
        : undefined,
      type: "website",
    },
  };
}

export default async function ListingDetailsPage({ params }: ListingDetailsPageProps) {
  const { listingId } = await params;
  const listing = await fetchPublicListingById(listingId);
  if (!listing) notFound();

  const firstListingImage = listing.images?.[0]?.url?.trim()
    ? (resolvePublicMediaUrl(listing.images[0].url) ?? listing.images[0].url)
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title || `إعلان رقم ${listingId}`,
    sku: listingId,
    url: buildAbsoluteUrl(`/listings/${listingId}`),
    image: firstListingImage,
    description: listing.description || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: listing.currency || "SYP",
      price: listing.price ?? undefined,
      availability: "https://schema.org/InStock",
      url: buildAbsoluteUrl(`/listings/${listingId}`),
    },
    brand: {
      "@type": "Brand",
      name: "سوقنا",
    },
  };

  return (
    <PublicShell>
      <JsonLdScript data={jsonLd} />
      <ListingDetailsView listingId={listingId} />
    </PublicShell>
  );
}
