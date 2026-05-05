import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "./providers";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "سوقنا — سوقك في الأردن",
    template: "%s | سوقنا",
  },
  description: "منصة إعلانات مبوبة للبيع والشراء في الأردن — عمّان وجميع المحافظات",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    siteName: "سوقنا",
    title: "سوقنا",
    description: "منصة إعلانات مبوبة للبيع والشراء في الأردن — عمّان وجميع المحافظات",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "سوقنا",
    description: "منصة إعلانات مبوبة للبيع والشراء في الأردن — عمّان وجميع المحافظات",
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
