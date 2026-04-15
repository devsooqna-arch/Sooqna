import * as admin from "firebase-admin";

let initialized = false;

/**
 * Initializes the Firebase Admin SDK once per cold start.
 * In Cloud Functions this uses default credentials automatically.
 */
export function ensureAdminApp(): void {
  if (initialized) {
    return;
  }
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  initialized = true;
}
