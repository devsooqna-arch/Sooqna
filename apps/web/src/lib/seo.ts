import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://un.flashpointjordan.com";
const SITE_NAME = "سوقنا";
const DEFAULT_DESCRIPTION =
  "سوقنا — منصة إعلانات مبوبة مجانية في سوريا. بيع واشترِ سيارات، عقارات، إلكترونيات وأكثر في حلب وجميع المحافظات.";
const DEFAULT_OG_IMAGE = "/branding/logo.png";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function buildAbsoluteUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function sanitizeMetadataText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateMetadataText(value: string, maxLength = 155): string {
  const clean = sanitizeMetadataText(value);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}…`;
}

export function buildPublicPageMetadata({
  title,
  description,
  pathname,
  image = DEFAULT_OG_IMAGE,
  robots,
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  robots?: Metadata["robots"];
}): Metadata {
  const cleanTitle = sanitizeMetadataText(title);
  const cleanDescription = truncateMetadataText(description);
  const url = buildAbsoluteUrl(pathname);
  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      type: "website",
      locale: "ar_SY",
      siteName: SITE_NAME,
      title: cleanTitle,
      description: cleanDescription,
      url,
      images: [{ url: image, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDescription,
      images: [image],
    },
    robots,
  };
}

export function noIndexMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export const seoDefaults = {
  siteName: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  image: DEFAULT_OG_IMAGE,
};
