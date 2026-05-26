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
    findByIds: jest.fn(),
    findByIdIncludingDeleted: jest.fn(),
    findByClientRequestId: jest.fn(),
    update: jest.fn(),
    updateFields: jest.fn(),
    addImage: jest.fn(),
    removeImage: jest.fn(),
    countImages: jest.fn(),
  };
}

function createInput(clientRequestId: string) {
  return {
    ownerId: "owner-1",
    ownerFullName: "Owner",
    ownerPhotoURL: "",
    title: "Camera",
    price: 125,
    currency: "USD" as const,
    categoryId: "electronics",
    description: "Clean camera",
    clientRequestId,
    location: {
      country: "Syria",
      city: "aleppo",
      area: "aleppo",
    },
  };
}

describe("listing create idempotency", () => {
  it("accepts a clientRequestId on the create listing contract", () => {
    const parsed = createListingBodySchema.parse({
      title: "Camera",
      price: 125,
      currency: "USD",
      categoryId: "electronics",
      description: "A clean camera",
      clientRequestId: "submit-123",
      location: {
        country: "Syria",
        city: "aleppo",
        area: "aleppo",
      },
    });

    expect(parsed.clientRequestId).toBe("submit-123");
  });

  it("returns the existing listing for repeated create requests with the same clientRequestId", async () => {
    const repo = createRepo();
    const service = new ListingsService(repo);

    const first = await service.create(createInput("submit-123"));
    repo.findByClientRequestId.mockResolvedValueOnce(first);

    const second = await service.create(createInput("submit-123"));

    expect(second.id).toBe(first.id);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.findByClientRequestId).toHaveBeenCalledWith("owner-1", "submit-123");
  });
});
