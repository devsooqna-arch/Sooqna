import type { DecodedIdToken } from "firebase-admin/auth";
import { UsersService } from "./users.service";
import type { UsersRepository } from "./repositories/users.repository";

function createToken(): DecodedIdToken {
  return {
    uid: "firebase-user-1",
    email: "user@example.com",
    email_verified: true,
    name: "User One",
    picture: "",
    aud: "project",
    auth_time: 0,
    exp: 0,
    firebase: { identities: {}, sign_in_provider: "password" },
    iat: 0,
    iss: "issuer",
    sub: "firebase-user-1",
  };
}

describe("UsersService identity sync", () => {
  it("surfaces profile upsert failures instead of returning an in-memory identity", async () => {
    const repo: jest.Mocked<UsersRepository> = {
      findByUid: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockRejectedValue(new Error("database unavailable")),
    };
    const service = new UsersService(repo);

    await expect(service.createOrUpdateProfileFromToken(createToken())).rejects.toMatchObject({
      statusCode: 503,
      code: "USER_SYNC_FAILED",
    });
  });
});
