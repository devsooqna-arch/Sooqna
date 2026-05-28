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
    findUnique: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  listingModerationLog: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
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
  city: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  upload: {
    count: jest.fn(),
  },
  $queryRawUnsafe: jest.fn(),
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
    mockPrisma.$transaction.mockImplementation(async (queries: unknown[]) => Promise.all(queries));
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
    mockPrisma.listing.groupBy.mockResolvedValueOnce([
      { locationCity: "amman", _count: { _all: 7 } },
    ]);
    mockPrisma.auditLog.findMany.mockResolvedValueOnce([]);

    const response = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", "Bearer admin-token");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.users.total).toBe(10);
    expect(response.body.data.listings.published).toBe(12);
    expect(response.body.data.reports.open).toBe(5);
    expect(response.body.data.topCities[0]).toEqual({ city: "amman", listingCount: 7 });
  });

  it("audits admin listing rejection through explicit moderation endpoint", async () => {
    mockUser(Role.ADMIN);
    mockPrisma.listing.findUnique.mockResolvedValue({ status: "pending" });
    mockPrisma.listingModerationLog.create.mockResolvedValue({});
    mockPrisma.listing.update.mockResolvedValue({
      id: "lst-1",
      title: "Flagged item",
      ownerId: "seller-1",
      status: "rejected",
      isFeatured: false,
      isApproved: false,
      publishedAt: null,
      archivedAt: null,
      soldAt: null,
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

  it("allows admins to manage cities", async () => {
    mockUser(Role.ADMIN);
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    mockPrisma.city.findMany.mockResolvedValueOnce([
      {
        id: "amman",
        nameAr: "عمّان",
        nameEn: "Amman",
        slug: "amman",
        isActive: true,
        sortOrder: 1,
        createdAt,
        updatedAt: createdAt,
      },
    ]);
    mockPrisma.listing.groupBy.mockResolvedValueOnce([{ locationCity: "amman", _count: { _all: 2 } }]);
    mockPrisma.city.create.mockResolvedValueOnce({
      id: "irbid",
      nameAr: "إربد",
      nameEn: "Irbid",
      slug: "irbid",
      isActive: true,
      sortOrder: 2,
      createdAt,
      updatedAt: createdAt,
    });
    mockPrisma.city.update.mockResolvedValueOnce({
      id: "irbid",
      nameAr: "إربد",
      nameEn: "Irbid",
      slug: "irbid",
      isActive: false,
      sortOrder: 2,
      createdAt,
      updatedAt: createdAt,
    });

    const listResponse = await request(app)
      .get("/api/admin/cities")
      .set("Authorization", "Bearer admin-token");
    const createResponse = await request(app)
      .post("/api/admin/cities")
      .set("Authorization", "Bearer admin-token")
      .send({ id: "irbid", slug: "irbid", nameAr: "إربد", nameEn: "Irbid", sortOrder: 2 });
    const updateResponse = await request(app)
      .patch("/api/admin/cities/irbid")
      .set("Authorization", "Bearer admin-token")
      .send({ isActive: false });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data[0].listingCount).toBe(2);
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.slug).toBe("irbid");
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.isActive).toBe(false);
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "admin.city.create",
          targetType: "city",
          targetId: "irbid",
        }),
      })
    );
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "admin.city.update",
          targetType: "city",
          targetId: "irbid",
        }),
      })
    );
  });
});
