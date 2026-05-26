import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailsView } from "@/components/listings/ListingDetailsView";
import { PublicShell } from "@/components/layout/PublicShell";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { listingTitleForPageMetadata } from "@/lib/listingMetadata";
import { arabicCity } from "@/lib/locationNames";
import { resolvePublicMediaUrl } from "@/lib/mediaUrl";
import {
  buildAbsoluteUrl,
  sanitizeMetadataText,
  seoDefaults,
  truncateMetadataText,
} from "@/lib/seo";
import { fetchPublicListingById } from "@/lib/server-listings";

type ListingDetailsPageProps = {
  params: Promise<{ listingId: string }>;
};

export async function generateMetadata({
  params,
}: ListingDetailsPageProps): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await fetchPublicListingById(listingId);

  if (!listing) {
    const title = "إعلان غير موجود";
    return {
      title,
      description: "لم يُعثر على هذا الإعلان في سوقنا.",
      alternates: { canonical: `/listings/${listingId}` },
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
      openGraph: {
        title,
        description: "لم يُعثر على هذا الإعلان في سوقنا.",
        url: buildAbsoluteUrl(`/listings/${listingId}`),
        type: "website",
      },
    };
  }

  const city = arabicCity(listing.location.city);
  const category = sanitizeMetadataText(listing.categoryId);
  const titleParts = [
    sanitizeMetadataText(listing.title),
    category,
    city,
  ].filter(Boolean);
  const title = listingTitleForPageMetadata(titleParts.join(" - "));
  const description = truncateMetadataText(
    listing.description ||
      `${listing.title} على سوقنا${city ? ` في ${city}` : ""}. شاهد التفاصيل وتواصل مع البائع بأمان داخل المنصة.`
  );
  const image = listing.images?.[0]?.url
    ? (resolvePublicMediaUrl(listing.images[0].url) ?? listing.images[0].url)
    : seoDefaults.image;

  return {
    title,
    description,
    alternates: {
      canonical: `/listings/${listingId}`,
    },
    openGraph: {
      title,
      description,
      url: buildAbsoluteUrl(`/listings/${listingId}`),
      siteName: seoDefaults.siteName,
      locale: "ar_SY",
      images: [{ url: image, alt: sanitizeMetadataText(listing.title) }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
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
  const firstListingImageAbsolute = firstListingImage?.startsWith("/")
    ? buildAbsoluteUrl(firstListingImage)
    : firstListingImage;

  const price = Number(listing.price);
  const hasValidPrice = Number.isFinite(price) && price >= 0 && listing.priceType !== "contact";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: buildAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "الإعلانات", item: buildAbsoluteUrl("/listings") },
      { "@type": "ListItem", position: 3, name: sanitizeMetadataText(listing.title), item: buildAbsoluteUrl(`/listings/${listingId}`) },
    ],
  };
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: sanitizeMetadataText(listing.title) || `إعلان رقم ${listingId}`,
    url: buildAbsoluteUrl(`/listings/${listingId}`),
    image: firstListingImageAbsolute,
    description: truncateMetadataText(listing.description || ""),
    ...(hasValidPrice
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: listing.currency || "SYP",
            price,
            availability: "https://schema.org/InStock",
            url: buildAbsoluteUrl(`/listings/${listingId}`),
          },
        }
      : {}),
    brand: {
      "@type": "Brand",
      name: "سوقنا",
    },
  };

  return (
    <PublicShell>
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLdScript data={productJsonLd} />
      <ListingDetailsView listingId={listingId} />
    </PublicShell>
  );
}
