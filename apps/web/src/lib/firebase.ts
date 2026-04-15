import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/**
 * Next.js exposes only `NEXT_PUBLIC_*` env vars to the browser bundle.
 * Set these in `.env.local` (see `.env.local.example`).
 */
function requirePublicEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to apps/web/.env.local (see .env.local.example).`
    );
  }
  return value;
}

const firebaseConfig = {
  apiKey: requirePublicEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requirePublicEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requirePublicEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requirePublicEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requirePublicEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requirePublicEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = getFirebaseApp();

/** Firebase Auth — use only from Client Components or client-side effects. */
export const auth: Auth = getAuth(app);

/** Firestore */
export const db: Firestore = getFirestore(app);

/** Cloud Storage */
export const storage: FirebaseStorage = getStorage(app);

export { app };
