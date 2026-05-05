import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "./providers";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "سوقنا — سوقك في سوريا",
    template: "%s | سوقنا",
  },
  description: "سوقنا — منصة إعلانات مبوبة مجانية في سوريا. بيع واشترِ سيارات، عقارات، إلكترونيات وأكثر في حلب وجميع المحافظات.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_SY",
    siteName: "سوقنا",
    title: "سوقنا — سوقك في سوريا",
    description: "سوقنا — منصة إعلانات مبوبة مجانية في سوريا. بيع واشترِ سيارات، عقارات، إلكترونيات وأكثر في حلب وجميع المحافظات.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "سوقنا — سوقك في سوريا",
    description: "سوقنا — منصة إعلانات مبوبة مجانية في سوريا. بيع واشترِ سيارات، عقارات، إلكترونيات وأكثر في حلب وجميع المحافظات.",
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
