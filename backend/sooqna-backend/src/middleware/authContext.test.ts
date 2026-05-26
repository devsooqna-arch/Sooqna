import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { requireActiveUser, requireCurrentUser } from "./authContext";

const mockFindByUid = jest.fn();
const mockUpsert = jest.fn();

jest.mock("../modules/users/repositories/users.repository", () => ({
  PrismaUsersRepository: jest.fn().mockImplementation(() => ({
    findByUid: (...args: unknown[]) => mockFindByUid(...args),
    upsert: (...args: unknown[]) => mockUpsert(...args),
  })),
}));

function createResponse(): jest.Mocked<Pick<Response, "status" | "json">> {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

function createRequest(overrides: Partial<Request> = {}): Request {
  return {
    authUser: {
      uid: "firebase-user-1",
      email: "user@example.com",
      email_verified: true,
      name: "User One",
      picture: "",
    },
    ...overrides,
  } as Request;
}

describe("auth context middleware", () => {
  beforeEach(() => {
    mockFindByUid.mockReset();
    mockUpsert.mockReset();
  });

  it("attaches a trusted DB-backed currentUser from the verified Firebase uid", async () => {
    mockFindByUid.mockResolvedValue({
      uid: "firebase-user-1",
      fullName: "User One",
      email: "user@example.com",
      photoURL: "",
      role: Role.BUYER,
      accountStatus: "active",
      isEmailVerified: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    mockUpsert.mockImplementation(async (profile) => profile);
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    await requireCurrentUser(req, res as unknown as Response, next);

    expect(mockFindByUid).toHaveBeenCalledWith("firebase-user-1");
    expect((req as Request & { currentUser?: unknown }).currentUser).toEqual(
      expect.objectContaining({
        firebaseUid: "firebase-user-1",
        role: Role.BUYER,
        accountStatus: "active",
      })
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 503 instead of allowing business actions when user sync lookup fails", async () => {
    mockFindByUid.mockRejectedValue(new Error("database unavailable"));
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    await requireCurrentUser(req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "USER_CONTEXT_UNAVAILABLE",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks suspended users from business actions", () => {
    const req = {
      ...createRequest(),
      currentUser: {
        firebaseUid: "firebase-user-1",
        email: "user@example.com",
        emailVerified: true,
        displayName: "User One",
        photoURL: "",
        dbUser: {
          id: "firebase-user-1",
          firebaseUid: "firebase-user-1",
        },
        role: Role.BUYER,
        accountStatus: "suspended",
      },
    } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();

    requireActiveUser(req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "ACCOUNT_NOT_ACTIVE",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
