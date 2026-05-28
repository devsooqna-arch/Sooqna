import request from "supertest";

const mockPrisma = {
  listing: {
    groupBy: jest.fn(),
    count: jest.fn(),
  },
};

jest.mock("../../config/prisma", () => ({
  prisma: mockPrisma,
}));

import { app } from "../../app";

describe("market routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns public market insights from published listings only", async () => {
    mockPrisma.listing.groupBy
      .mockResolvedValueOnce([{ locationCity: "amman", _count: { _all: 12 } }])
      .mockResolvedValueOnce([{ categoryId: "cars", _count: { _all: 9 } }])
      .mockResolvedValueOnce([{ categoryId: "cars", _avg: { price: 8432.4 }, _count: { _all: 9 } }]);
    mockPrisma.listing.count.mockResolvedValueOnce(5);

    const response = await request(app).get("/api/market/insights");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        topCities: [{ city: "amman", listingCount: 12 }],
        topCategories: [{ categoryId: "cars", listingCount: 9 }],
        averagePricesByCategory: [{ categoryId: "cars", averagePrice: 8432 }],
        newListings7d: 5,
      },
    });
    expect(mockPrisma.listing.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, status: "published" },
        take: 10,
      })
    );
  });
});
