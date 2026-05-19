import { createListingBodySchema } from "../../shared/validation/schemas";
import { ListingsService } from "./listings.service";
import type { ListingsRepository } from "./repositories/listings.repository";
import type { Listing } from "./listings.types";

jest.mock("../users/repositories/users.repository", () => ({
  PrismaUsersRepository: jest.fn().mockImplementation(() => ({
    findByUid: jest.fn().mockResolvedValue({ uid: "owner-1" }),
  })),
}));

function createRepo(): jest.Mocked<ListingsRepository> {
  return {
    create: jest.fn(async (listing: Listing) => listing),
    list: jest.fn(),
    listByOwner: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };
}

describe("listing currency contract", () => {
  it("accepts the currency sent by the submit listing form", () => {
    const parsed = createListingBodySchema.parse({
      title: "Camera",
      price: 125,
      currency: "USD",
      categoryId: "electronics",
      description: "A clean camera",
      location: {
        country: "Syria",
        city: "aleppo",
        area: "aleppo",
      },
    });

    expect(parsed.currency).toBe("USD");
  });

  it("rejects unsupported listing currencies", () => {
    expect(() =>
      createListingBodySchema.parse({
        title: "Camera",
        price: 125,
        currency: "JOD",
        categoryId: "electronics",
        description: "A clean camera",
        location: {
          country: "Syria",
          city: "aleppo",
          area: "aleppo",
        },
      })
    ).toThrow();
  });

  it("persists the requested listing currency instead of forcing SYP", async () => {
    const repo = createRepo();
    const service = new ListingsService(repo);

    const listing = await service.create({
      ownerId: "owner-1",
      ownerFullName: "Owner",
      ownerPhotoURL: "",
      title: "Camera",
      price: 125,
      currency: "USD",
      categoryId: "electronics",
      description: "A clean camera",
      location: {
        country: "Syria",
        city: "aleppo",
        area: "aleppo",
      },
    } as Parameters<ListingsService["create"]>[0] & { currency: "USD" });

    expect(listing.currency).toBe("USD");
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ currency: "USD" }));
  });
});
