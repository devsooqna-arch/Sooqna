import request from "supertest";

const mockPrisma = {
  listing: {
    aggregate: jest.fn(),
  },
};

jest.mock("../../config/prisma", () => ({
  prisma: mockPrisma,
}));

import { app } from "../../app";

describe("listing price insights", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires categoryId", async () => {
    const response = await request(app).get("/api/listings/price-insights");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns aggregate price guidance for comparable published listings", async () => {
    mockPrisma.listing.aggregate.mockResolvedValueOnce({
      _count: { _all: 12 },
      _avg: { price: 8432.4 },
      _min: { price: 4500 },
      _max: { price: 12000 },
    });

    const response = await request(app).get("/api/listings/price-insights?categoryId=cars&city=amman&condition=used");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        sampleSize: 12,
        averagePrice: 8432,
        minPrice: 4500,
        maxPrice: 12000,
        confidence: "medium",
      },
    });
    expect(mockPrisma.listing.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: "published",
          categoryId: "cars",
          locationCity: "amman",
          condition: "used",
        },
      })
    );
  });
});
