import { resolveFirebaseAdminCredentialMode } from "./firebaseAdminCredentialMode";

describe("Firebase Admin credential mode", () => {
  it("uses explicit service account env when project id, client email, and private key are present", () => {
    expect(
      resolveFirebaseAdminCredentialMode({
        projectId: "project-1",
        clientEmail: "firebase-admin@example.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
        serviceAccountPath: "",
      })
    ).toBe("service-account-env");
  });

  it("uses service account file mode when a path is provided", () => {
    expect(
      resolveFirebaseAdminCredentialMode({
        projectId: "project-1",
        clientEmail: "",
        privateKey: "",
        serviceAccountPath: "/secure/firebase.json",
      })
    ).toBe("service-account-file");
  });

  it("fails production credential validation when only project id is present", () => {
    expect(() =>
      resolveFirebaseAdminCredentialMode(
        {
          projectId: "project-1",
          clientEmail: "",
          privateKey: "",
          serviceAccountPath: "",
        },
        { allowApplicationDefaultCredentials: false }
      )
    ).toThrow(/Firebase Admin credentials are incomplete/);
  });
});
