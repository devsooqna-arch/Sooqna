import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { fetchPublicListings } from "@/lib/server-listings";

const staticRoutes = [
  "/",
  "/listings",
  "/categories",
  "/about",
  "/contact",
  "/terms",
  "/login",
  "/register",
  "/reset-password",
  "/submit-listing",
  "/favorites",
  "/messages",
  "/me",
  "/me/settings",
  "/my-listings",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const listingLimit = Number(process.env.NEXT_PUBLIC_SITEMAP_LISTINGS_LIMIT ?? "200");
  if (!Number.isFinite(listingLimit) || listingLimit <= 0) {
    return staticEntries;
  }

  const listings = await fetchPublicListings(listingLimit);
  const listingEntries: MetadataRoute.Sitemap = listings
    .filter((listing) => listing.status === "published" && !listing.deletedAt)
    .map((listing) => ({
      url: `${siteUrl}/listings/${listing.id}`,
      lastModified: listing.updatedAt ? new Date(listing.updatedAt) : now,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  return [...staticEntries, ...listingEntries];
}
