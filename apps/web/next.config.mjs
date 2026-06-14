import path from "path";
import { fileURLToPath } from "url";
import { wpExactRedirects, wpPatternRedirects } from "./wp-redirects.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV === "development";
const backendApiBase = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? "http://localhost:5000/api";
const uploadsRewriteTarget = `${backendApiBase.replace(/\/api\/?$/, "").replace(/\/$/, "")}/uploads/:path*`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "un.flashpointjordan.com" },
      // Local dev: backend serves uploaded listing images from /uploads.
      ...(isDevelopment ? [{ protocol: "http", hostname: "localhost", port: "5000" }] : []),
    ],
  },
  pageExtensions: isDevelopment ? ["tsx", "ts", "jsx", "js", "dev.tsx"] : ["tsx", "ts", "jsx", "js"],
  // Disable experimental devtools overlay hooks that were causing
  // Segment Explorer manifest/runtime errors in this environment.
  devIndicators: false,
  experimental: {
    // Workaround for Next.js dev bundler bug on some Windows/embedded-browser setups.
    // Error signature: "segment-explorer-node.js#SegmentViewNode" missing in React Client Manifest.
    devtoolSegmentExplorer: false,
  },
  /** Keep tracing inside `apps/web` when a parent folder has another lockfile. */
  outputFileTracingRoot: path.join(__dirname),
  /**
   * Transpile Firebase + @firebase/* so modern syntax does not cause
   * "Invalid or unexpected token" in older embedded browsers (e.g. IDE preview).
   */
  transpilePackages: [
    "firebase",
    "@firebase/app",
    "@firebase/auth",
    "@firebase/component",
    "@firebase/logger",
    "@firebase/util",
    "@firebase/webchannel-wrapper",
  ],
  webpack: (config, { dev }) => {
    if (dev) {
      // Embedded browsers can choke on eval-based dev bundles and throw
      // "Invalid or unexpected token" in app/layout.js.
      config.devtool = "source-map";
    }
    return config;
  },
  async redirects() {
    return [
      ...wpExactRedirects,
      ...wpPatternRedirects,
      // Non-WP compatibility redirects can be added below.
      { source: "/profile", destination: "/me", permanent: true },
      { source: "/profile/:path*", destination: "/me", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: uploadsRewriteTarget,
      },
    ];
  },
};

export default nextConfig;
