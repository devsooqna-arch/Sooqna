import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { AppProviders } from "./providers";
import { getSiteUrl, seoDefaults } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "سوقنا — سوقك في سوريا",
    template: "%s | سوقنا",
  },
  description: seoDefaults.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_SY",
    siteName: seoDefaults.siteName,
    title: "سوقنا — سوقك في سوريا",
    description: seoDefaults.description,
    url: "/",
    images: [{ url: seoDefaults.image, alt: seoDefaults.siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: "سوقنا — سوقك في سوريا",
    description: seoDefaults.description,
    images: [seoDefaults.image],
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

const HYDRATION_ATTR_CLEANUP_SCRIPT = `
(function () {
  try {
    var attr = "fdprocessedid";
    var clean = function (root) {
      if (!root || !root.querySelectorAll) return;
      root.querySelectorAll("[" + attr + "]").forEach(function (node) {
        node.removeAttribute(attr);
      });
    };
    clean(document);
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        if (record.type === "attributes" && record.attributeName === attr) {
          record.target.removeAttribute(attr);
        }
        record.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            if (node.hasAttribute && node.hasAttribute(attr)) {
              node.removeAttribute(attr);
            }
            clean(node);
          }
        });
      });
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: [attr],
      childList: true,
      subtree: true,
    });
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="classic" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="sooqna-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <Script id="sooqna-hydration-attr-cleanup" strategy="beforeInteractive">
          {HYDRATION_ATTR_CLEANUP_SCRIPT}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
