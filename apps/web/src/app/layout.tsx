import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "./providers";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Sooqna",
    template: "%s | Sooqna",
  },
  description: "Marketplace",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    siteName: "Sooqna",
    title: "Sooqna",
    description: "Marketplace",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sooqna",
    description: "Marketplace",
  },
  icons: {
    icon: "/branding/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
