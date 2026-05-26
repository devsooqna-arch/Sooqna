import request from "supertest";
import { Role } from "@prisma/client";

const mockVerifyIdToken = jest.fn();
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  listing: {
    count: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  report: {
    count: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  category: {
    count: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
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

function mockUser(role: Role) {
  const user = {
    id: `${role.toLowerCase()}-db`,
    firebaseUid: `${role.toLowerCase()}-uid`,
    email: `${role.toLowerCase()}@example.com`,
    name: `${role} User`,
    avatarUrl: "",
    bio: "",
    phone: "",
    role,
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

describe("admin routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockImplementation(async (token: string) => ({
      uid: token === "buyer-token" ? "buyer-uid" : "admin-uid",
      email: "admin@example.com",
      email_verified: true,
      name: "Admin",
      picture: "",
    }));
    mockPrisma.auditLog.count.mockResolvedValue(1);
  });

  it("blocks unauthenticated users from admin stats", async () => {
    const response = await request(app).get("/api/admin/stats");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("blocks normal users from admin stats", async () => {
    mockUser(Role.BUYER);

    const response = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", "Bearer buyer-token");

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("allows admins to read paginated stats", async () => {
    mockUser(Role.ADMIN);
    mockPrisma.user.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(2);
    mockPrisma.listing.count
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(4);
    mockPrisma.report.count.mockResolvedValueOnce(5);
    mockPrisma.auditLog.findMany.mockResolvedValueOnce([]);

    const response = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", "Bearer admin-token");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.users.total).toBe(10);
    expect(response.body.data.listings.published).toBe(12);
    expect(response.body.data.reports.open).toBe(5);
  });

  it("audits admin listing rejection through explicit moderation endpoint", async () => {
    mockUser(Role.ADMIN);
    mockPrisma.listing.update.mockResolvedValue({
      id: "lst-1",
      title: "Flagged item",
      ownerId: "seller-1",
      status: "rejected",
      isFeatured: false,
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    const response = await request(app)
      .post("/api/admin/listings/lst-1/reject")
      .set("Authorization", "Bearer admin-token")
      .send({ reason: "Policy violation" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockPrisma.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "lst-1" },
        data: expect.objectContaining({
          status: "rejected",
          isFeatured: false,
        }),
      })
    );
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: "admin-uid",
          action: "admin.listing.reject",
          targetType: "listing",
          targetId: "lst-1",
        }),
      })
    );
  });
});
