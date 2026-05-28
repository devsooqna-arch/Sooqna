import request from "supertest";
import { Role } from "@prisma/client";

const mockVerifyIdToken = jest.fn();
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  savedSearch: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("../../config/firebaseAdmin", () => ({
  adminAuth: {
    verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args),
  },
}));

jest.mock("../../config/prisma", () => ({
  prisma: mockPrisma,
}));

import { app } from "../../app";

function mockUser() {
  const user = {
    id: "buyer-db",
    firebaseUid: "buyer-uid",
    email: "buyer@example.com",
    name: "Buyer User",
    avatarUrl: "",
    bio: "",
    phone: "",
    role: Role.BUYER,
    accountStatus: "active",
    isEmailVerified: true,
    isPhoneVerified: false,
    isIdVerified: false,
    avgRating: 0,
    totalReviews: 0,
    totalListings: 0,
    totalSold: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  mockPrisma.user.findUnique.mockResolvedValue(user);
  mockPrisma.user.upsert.mockResolvedValue(user);
}

describe("saved searches routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockResolvedValue({
      uid: "buyer-uid",
      email: "buyer@example.com",
      email_verified: true,
      name: "Buyer",
      picture: "",
    });
  });

  it("requires authentication", async () => {
    const response = await request(app).get("/api/saved-searches");

    expect(response.status).toBe(401);
  });

  it("lists current user's saved searches", async () => {
    mockUser();
    mockPrisma.savedSearch.findMany.mockResolvedValueOnce([
      {
        id: "search-1",
        name: "Cars in Amman",
        query: { category: "cars", city: "amman" },
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
        updatedAt: new Date("2026-05-01T00:00:00.000Z"),
      },
    ]);

    const response = await request(app)
      .get("/api/saved-searches")
      .set("Authorization", "Bearer buyer-token");

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toEqual({
      id: "search-1",
      name: "Cars in Amman",
      query: { category: "cars", city: "amman" },
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
    });
    expect(mockPrisma.savedSearch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "buyer-uid" } })
    );
  });

  it("creates a saved search with sanitized query keys", async () => {
    mockUser();
    mockPrisma.savedSearch.create.mockResolvedValueOnce({
      id: "search-2",
      name: "Cars",
      query: { category: "cars", city: "amman" },
      createdAt: new Date("2026-05-02T00:00:00.000Z"),
      updatedAt: new Date("2026-05-02T00:00:00.000Z"),
    });

    const response = await request(app)
      .post("/api/saved-searches")
      .set("Authorization", "Bearer buyer-token")
      .send({ name: "Cars", query: { category: "cars", city: "amman", unsafe: "nope" } });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe("search-2");
    expect(mockPrisma.savedSearch.create).toHaveBeenCalledWith({
      data: {
        userId: "buyer-uid",
        name: "Cars",
        query: { category: "cars", city: "amman" },
      },
    });
  });

  it("deletes only a saved search owned by the current user", async () => {
    mockUser();
    mockPrisma.savedSearch.findFirst.mockResolvedValueOnce({
      id: "search-3",
      userId: "buyer-uid",
    });
    mockPrisma.savedSearch.delete.mockResolvedValueOnce({});

    const response = await request(app)
      .delete("/api/saved-searches/search-3")
      .set("Authorization", "Bearer buyer-token");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ id: "search-3", deleted: true });
    expect(mockPrisma.savedSearch.findFirst).toHaveBeenCalledWith({
      where: { id: "search-3", userId: "buyer-uid" },
    });
  });
});
