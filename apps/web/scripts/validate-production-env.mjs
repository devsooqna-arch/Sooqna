const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  process.exit(0);
}

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_BACKEND_API_BASE_URL",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missing = required.filter((name) => !process.env[name]?.trim());
const errors = [];

if (missing.length) {
  errors.push(`Missing required production env vars: ${missing.join(", ")}`);
}

for (const name of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_BACKEND_API_BASE_URL", "NEXT_PUBLIC_UPLOADS_PUBLIC_BASE_URL"]) {
  const value = process.env[name]?.trim();
  if (value && /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/i.test(value)) {
    errors.push(`${name} must not point to localhost in production builds.`);
  }
}

const sitemapLimit = process.env.NEXT_PUBLIC_SITEMAP_LISTINGS_LIMIT;
if (sitemapLimit && (!Number.isInteger(Number(sitemapLimit)) || Number(sitemapLimit) < 1 || Number(sitemapLimit) > 1000)) {
  errors.push("NEXT_PUBLIC_SITEMAP_LISTINGS_LIMIT must be an integer between 1 and 1000.");
}

const sitemapTimeout = process.env.NEXT_PUBLIC_SITEMAP_FETCH_TIMEOUT_MS;
if (sitemapTimeout && (!Number.isInteger(Number(sitemapTimeout)) || Number(sitemapTimeout) < 1000 || Number(sitemapTimeout) > 30000)) {
  errors.push("NEXT_PUBLIC_SITEMAP_FETCH_TIMEOUT_MS must be an integer between 1000 and 30000.");
}

if (errors.length) {
  for (const error of errors) {
    console.error(`[env] ${error}`);
  }
  process.exit(1);
}

console.log("[env] production public env validation passed");
