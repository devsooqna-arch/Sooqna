import * as fs from "node:fs";
import * as admin from "firebase-admin";
import { env } from "./env";
import { logger } from "./logger";
import {
  resolveFirebaseAdminCredentialMode,
  type FirebaseAdminCredentialMode,
} from "./firebaseAdminCredentialMode";

let initialized = false;

function getCredentialMode(): FirebaseAdminCredentialMode {
  return resolveFirebaseAdminCredentialMode(
    {
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey,
      serviceAccountPath: env.firebaseServiceAccountPath,
    },
    {
      allowApplicationDefaultCredentials:
        env.firebaseUseApplicationDefaultCredentials || env.nodeEnv !== "production",
    }
  );
}

function buildCredential(mode: FirebaseAdminCredentialMode): admin.credential.Credential | undefined {
  if (mode === "service-account-file") {
    if (!fs.existsSync(env.firebaseServiceAccountPath)) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH does not point to a readable file.");
    }
    const raw = fs.readFileSync(env.firebaseServiceAccountPath, "utf8");
    return admin.credential.cert(JSON.parse(raw));
  }

  if (mode === "service-account-env") {
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
  const mode = getCredentialMode();
  const credential = buildCredential(mode);
  if (credential) {
    admin.initializeApp({ credential, projectId: env.firebaseProjectId || undefined });
  } else {
    admin.initializeApp({ projectId: env.firebaseProjectId || undefined });
  }
  logger.info("Firebase Admin initialized", { credentialMode: mode });
  initialized = true;
}

ensureFirebaseAdmin();
export const adminAuth = admin.auth();

