import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dev-tools",
        "/auth-test",
        "/listings-test",
        "/me",
        "/me/settings",
        "/messages",
        "/favorites",
        "/my-listings",
        "/submit-listing",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
