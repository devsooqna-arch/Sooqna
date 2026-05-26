export type FirebaseAdminCredentialMode =
  | "service-account-file"
  | "service-account-env"
  | "application-default";

export type FirebaseAdminCredentialInput = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  serviceAccountPath: string;
};

export function resolveFirebaseAdminCredentialMode(
  input: FirebaseAdminCredentialInput,
  options: { allowApplicationDefaultCredentials?: boolean } = {}
): FirebaseAdminCredentialMode {
  if (input.serviceAccountPath.trim()) {
    return "service-account-file";
  }

  const hasEnvCredential = Boolean(
    input.projectId.trim() && input.clientEmail.trim() && input.privateKey.trim()
  );
  if (hasEnvCredential) {
    return "service-account-env";
  }

  const hasPartialEnvCredential = Boolean(input.clientEmail.trim() || input.privateKey.trim());
  if (hasPartialEnvCredential || !options.allowApplicationDefaultCredentials) {
    throw new Error(
      "Firebase Admin credentials are incomplete. Provide FIREBASE_SERVICE_ACCOUNT_PATH, or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, or explicitly enable Application Default Credentials."
    );
  }

  return "application-default";
}
