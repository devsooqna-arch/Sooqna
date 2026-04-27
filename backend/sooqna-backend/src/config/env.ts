import * as dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

function requireInProduction(value: string | undefined, name: string): string {
  if (!value && isProduction) {
    throw new Error(`Environment variable ${name} is required in production.`);
  }
  return value ?? "";
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN ?? (isProduction
    ? (() => { throw new Error("CORS_ORIGIN env var is required in production."); })()
    : "http://localhost:3000"),
  uploadsPublicBaseUrl:
    process.env.UPLOADS_PUBLIC_BASE_URL ?? "http://localhost:5000/uploads",
  firebaseProjectId: requireInProduction(process.env.FIREBASE_PROJECT_ID, "FIREBASE_PROJECT_ID"),
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "",
  enableCategoriesJsonFallback: process.env.ENABLE_CATEGORIES_JSON_FALLBACK ?? "false",
};

