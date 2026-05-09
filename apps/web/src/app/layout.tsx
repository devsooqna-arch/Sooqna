import type { Metadata } from "next";
import Script from "next/script";
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

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var k = "sooqna-theme";
    var t = localStorage.getItem(k);
    if (t === "classic" || t === "light" || t === "dark") {
      document.documentElement.dataset.theme = t;
    } else {
      document.documentElement.dataset.theme = "classic";
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="classic" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="sooqna-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
