import * as dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5000",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  uploadsPublicBaseUrl:
    process.env.UPLOADS_PUBLIC_BASE_URL ?? "http://localhost:5000/uploads",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "",
  required,
};

