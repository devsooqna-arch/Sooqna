import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Next.js inlines only **direct** `process.env.NEXT_PUBLIC_*` reads at build time.
 * Do not use dynamic keys like `process.env[name]` — they become `undefined` in the browser bundle.
 *
 * Set values in `apps/web/.env.local` (see `.env.local.example`).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function assertFirebaseConfig(): void {
  if (!firebaseConfig.apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_API_KEY. Add apps/web/.env.local from .env.local.example and restart the dev server."
    );
  }
}

function getFirebaseApp(): FirebaseApp {
  assertFirebaseConfig();
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = getFirebaseApp();

/** Firebase Auth — use only from Client Components or client-side effects. */
export const auth: Auth = getAuth(app);

export { app };
