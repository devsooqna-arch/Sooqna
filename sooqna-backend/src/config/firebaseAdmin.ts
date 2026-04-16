import * as fs from "node:fs";
import * as admin from "firebase-admin";
import { env } from "./env";

let initialized = false;

function buildCredential(): admin.credential.Credential | undefined {
  if (env.firebaseServiceAccountPath && fs.existsSync(env.firebaseServiceAccountPath)) {
    const raw = fs.readFileSync(env.firebaseServiceAccountPath, "utf8");
    return admin.credential.cert(JSON.parse(raw));
  }

  if (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) {
    return admin.credential.cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey,
    });
  }
  return undefined;
}

export function ensureFirebaseAdmin(): void {
  if (initialized || admin.apps.length) {
    initialized = true;
    return;
  }
  const credential = buildCredential();
  if (credential) {
    admin.initializeApp({ credential, projectId: env.firebaseProjectId || undefined });
  } else {
    admin.initializeApp({ projectId: env.firebaseProjectId || undefined });
  }
  initialized = true;
}

ensureFirebaseAdmin();
export const adminAuth = admin.auth();

