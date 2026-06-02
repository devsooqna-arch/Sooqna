const mockPrisma = {
  upload: {
    create: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock("../../config/prisma", () => ({
  prisma: mockPrisma,
}));

import { PrismaUploadsRepository } from "./uploads.repository";

describe("PrismaUploadsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("links an unattached upload to a listing by path", async () => {
    mockPrisma.upload.updateMany.mockResolvedValue({ count: 1 });

    const repo = new PrismaUploadsRepository();
    const count = await repo.markAttachedToListing("uploads/listings/user-1/photo.png", "lst-1");

    expect(count).toBe(1);
    expect(mockPrisma.upload.updateMany).toHaveBeenCalledWith({
      where: { path: "uploads/listings/user-1/photo.png", listingId: null },
      data: { listingId: "lst-1" },
    });
  });

  it("finds unattached uploads older than a cutoff", async () => {
    const cutoff = new Date("2026-06-01T00:00:00.000Z");
    mockPrisma.upload.findMany.mockResolvedValue([]);

    const repo = new PrismaUploadsRepository();
    await repo.findUnattachedOlderThan(cutoff, 25);

    expect(mockPrisma.upload.findMany).toHaveBeenCalledWith({
      where: { listingId: null, createdAt: { lt: cutoff } },
      orderBy: { createdAt: "asc" },
      take: 25,
    });
  });

  it("deletes orphan upload rows by id and skips empty batches", async () => {
    const repo = new PrismaUploadsRepository();

    await expect(repo.deleteByIds([])).resolves.toBe(0);
    expect(mockPrisma.upload.deleteMany).not.toHaveBeenCalled();

    mockPrisma.upload.deleteMany.mockResolvedValue({ count: 2 });
    await expect(repo.deleteByIds(["upl-1", "upl-2"])).resolves.toBe(2);
    expect(mockPrisma.upload.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["upl-1", "upl-2"] } },
    });
  });
});
