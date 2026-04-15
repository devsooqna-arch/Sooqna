import * as admin from "firebase-admin";
import * as path from "node:path";
import { existsSync, readFileSync } from "node:fs";

let initialized = false;

function detectProjectId(): string | undefined {
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  if (process.env.FIREBASE_CONFIG) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_CONFIG);
      if (parsed && typeof parsed.projectId === "string" && parsed.projectId.trim()) {
        return parsed.projectId;
      }
    } catch {
      // Ignore malformed FIREBASE_CONFIG and fallback to .firebaserc.
    }
  }

  // Local scripts fallback: read project id from repo root .firebaserc.
  try {
    const rcPath = path.resolve(process.cwd(), "../../.firebaserc");
    if (!existsSync(rcPath)) return undefined;
    const rc = JSON.parse(readFileSync(rcPath, "utf8")) as {
      projects?: { default?: string };
    };
    const projectId = rc.projects?.default;
    if (projectId && projectId.trim()) {
      return projectId;
    }
  } catch {
    // Ignore parse/read errors.
  }

  return undefined;
}

/**
 * Initializes the Firebase Admin SDK once per cold start.
 * In Cloud Functions this uses default credentials automatically.
 */
export function ensureAdminApp(): void {
  if (initialized) {
    return;
  }
  if (!admin.apps.length) {
    const projectId = detectProjectId();
    if (projectId) {
      admin.initializeApp({ projectId });
    } else {
      admin.initializeApp();
    }
  }
  initialized = true;
}

/**
 * Shared Firestore Admin instance.
 * `ensureAdminApp()` is called defensively in function modules and at root index.
 */
ensureAdminApp();
export const adminDb = admin.firestore();
