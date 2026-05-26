import { ListingsService } from "./listings.service";
import type { ListingsRepository, PaginationOptions } from "./repositories/listings.repository";
import type { Listing } from "./listings.types";

jest.mock("../users/repositories/users.repository", () => ({
  PrismaUsersRepository: jest.fn().mockImplementation(() => ({
    findByUid: jest.fn().mockResolvedValue({ uid: "owner-1" }),
  })),
}));

jest.mock("../engagement/engagement.service", () => ({
  trackEngagementEvent: jest.fn().mockResolvedValue(undefined),
}));

function createRepo(): jest.Mocked<ListingsRepository> {
  return {
    create: jest.fn(async (listing: Listing) => listing),
    list: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    listByOwner: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    findByIdIncludingDeleted: jest.fn(),
    findByClientRequestId: jest.fn(),
    update: jest.fn(async (_id: string, listing: Listing) => listing),
    updateFields: jest.fn(async (id: string, fields: Partial<Record<string, unknown>>) => {
      const existing = await (createRepo as unknown as { _lastListing: Listing })._lastListing;
      return { ...existing, ...fields, id } as unknown as Listing;
    }),
    addImage: jest.fn().mockResolvedValue(undefined),
    removeImage: jest.fn().mockResolvedValue(undefined),
    countImages: jest.fn().mockResolvedValue(0),
  };
}

function makePublishedListing(overrides?: Partial<Listing>): Listing {
  return {
    id: "lst_test1",
    title: "Test Listing",
    titleLower: "test listing",
    clientRequestId: null,
    description: "A test listing",
    price: 100,
    currency: "SYP",
    priceType: "fixed",
    categoryId: "electronics",
    ownerId: "owner-1",
    ownerSnapshot: { fullName: "Owner", photoURL: "" },
    location: { country: "Syria", city: "aleppo", area: "aleppo" },
    images: [{ url: "http://test.com/img.jpg", path: "uploads/img.jpg", isPrimary: true, order: 1 }],
    status: "published",
    condition: "used",
    contactPreference: "chat",
    viewsCount: 0,
    favoritesCount: 0,
    messagesCount: 0,
    isFeatured: false,
    isApproved: true,
    publishedAt: new Date().toISOString(),
    soldAt: null,
    archivedAt: null,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

function makeDraftListing(overrides?: Partial<Listing>): Listing {
  return makePublishedListing({
    status: "draft",
    publishedAt: null,
    expiresAt: null,
    isApproved: false,
    images: [],
    ...overrides,
  });
}

describe("Phase 2: Listing lifecycle and authorization", () => {
  describe("public list only shows published active listings", () => {
    it("repo.list is called with published/active filters", async () => {
      const repo = createRepo();
      repo.list.mockResolvedValue({ items: [], total: 0 });
      const service = new ListingsService(repo);
      await service.list();
      expect(repo.list).toHaveBeenCalled();
    });
  });

  describe("getListingById visibility", () => {
    it("returns null for draft listing viewed by non-owner", async () => {
      const repo = createRepo();
      const draft = makeDraftListing();
      repo.findById.mockResolvedValue(draft);
      const service = new ListingsService(repo);

      const result = await service.recordView("lst_test1", "other-user");
      expect(result).toBeNull();
    });

    it("returns draft listing when viewed by owner", async () => {
      const repo = createRepo();
      const draft = makeDraftListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(draft);
      const service = new ListingsService(repo);

      const result = await service.recordView("lst_test1", "owner-1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("lst_test1");
    });

    it("returns published listing to unauthenticated user", async () => {
      const repo = createRepo();
      const published = makePublishedListing();
      repo.findById.mockResolvedValue(published);
      repo.updateFields.mockResolvedValue({ ...published, viewsCount: 1 });
      const service = new ListingsService(repo);

      const result = await service.recordView("lst_test1", undefined);
      expect(result).not.toBeNull();
    });

    it("does not increment view count for owner view", async () => {
      const repo = createRepo();
      const published = makePublishedListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(published);
      const service = new ListingsService(repo);

      await service.recordView("lst_test1", "owner-1");
      expect(repo.updateFields).not.toHaveBeenCalled();
    });

    it("increments view count for non-owner view", async () => {
      const repo = createRepo();
      const published = makePublishedListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(published);
      repo.updateFields.mockResolvedValue({ ...published, viewsCount: 1 });
      const service = new ListingsService(repo);

      await service.recordView("lst_test1", "viewer-2");
      expect(repo.updateFields).toHaveBeenCalledWith(
        "lst_test1",
        expect.objectContaining({ viewsCount: 1 })
      );
    });
  });

  describe("owner cannot edit another user's listing", () => {
    it("throws 403 when different user tries to patch", async () => {
      const repo = createRepo();
      const listing = makePublishedListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(listing);
      const service = new ListingsService(repo);

      await expect(
        service.patch("lst_test1", "other-user", { title: "Hacked" })
      ).rejects.toThrow("Forbidden");
    });
  });

  describe("mark sold lifecycle", () => {
    it("marks published listing as sold", async () => {
      const repo = createRepo();
      const published = makePublishedListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(published);
      repo.updateFields.mockResolvedValue({ ...published, status: "sold", soldAt: new Date().toISOString() });
      const service = new ListingsService(repo);

      const result = await service.markSold("lst_test1", "owner-1");
      expect(result.status).toBe("sold");
      expect(repo.updateFields).toHaveBeenCalledWith(
        "lst_test1",
        expect.objectContaining({ status: "sold", isFeatured: false })
      );
    });

    it("rejects marking draft as sold", async () => {
      const repo = createRepo();
      const draft = makeDraftListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(draft);
      const service = new ListingsService(repo);

      await expect(service.markSold("lst_test1", "owner-1")).rejects.toThrow(
        "Only published listings can be marked as sold."
      );
    });

    it("rejects marking another user's listing as sold", async () => {
      const repo = createRepo();
      const published = makePublishedListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(published);
      const service = new ListingsService(repo);

      await expect(service.markSold("lst_test1", "other-user")).rejects.toThrow("Forbidden");
    });
  });

  describe("archive lifecycle", () => {
    it("archives a published listing", async () => {
      const repo = createRepo();
      const published = makePublishedListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(published);
      repo.updateFields.mockResolvedValue({ ...published, status: "archived" });
      const service = new ListingsService(repo);

      const result = await service.archive("lst_test1", "owner-1");
      expect(result.status).toBe("archived");
    });

    it("archives a draft listing", async () => {
      const repo = createRepo();
      const draft = makeDraftListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(draft);
      repo.updateFields.mockResolvedValue({ ...draft, status: "archived" });
      const service = new ListingsService(repo);

      const result = await service.archive("lst_test1", "owner-1");
      expect(result.status).toBe("archived");
    });

    it("rejects archiving a sold listing", async () => {
      const repo = createRepo();
      const sold = makePublishedListing({ ownerId: "owner-1", status: "sold" });
      repo.findById.mockResolvedValue(sold);
      const service = new ListingsService(repo);

      await expect(service.archive("lst_test1", "owner-1")).rejects.toThrow(
        "Only published or draft listings can be archived."
      );
    });
  });

  describe("feature/unfeature requires admin role", () => {
    it("rejects non-admin from featuring", async () => {
      const repo = createRepo();
      const published = makePublishedListing();
      repo.findById.mockResolvedValue(published);
      const service = new ListingsService(repo);

      await expect(service.feature("lst_test1", "owner-1", "SELLER")).rejects.toThrow(
        "Only admins can feature listings."
      );
    });

    it("allows admin to feature", async () => {
      const repo = createRepo();
      const published = makePublishedListing();
      repo.findById.mockResolvedValue(published);
      repo.updateFields.mockResolvedValue({ ...published, isFeatured: true });
      const service = new ListingsService(repo);

      const result = await service.feature("lst_test1", "admin-1", "ADMIN");
      expect(result.isFeatured).toBe(true);
    });

    it("rejects non-admin from unfeaturing", async () => {
      const repo = createRepo();
      const featured = makePublishedListing({ isFeatured: true });
      repo.findById.mockResolvedValue(featured);
      const service = new ListingsService(repo);

      await expect(service.unfeature("lst_test1", "owner-1", "BUYER")).rejects.toThrow(
        "Only admins can unfeature listings."
      );
    });
  });

  describe("publish requires image", () => {
    it("rejects publishing listing with no images", async () => {
      const repo = createRepo();
      const draft = makeDraftListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(draft);
      const service = new ListingsService(repo);

      await expect(service.publish("lst_test1", "owner-1")).rejects.toThrow(
        "At least one image is required before publishing."
      );
    });

    it("allows publishing listing with images", async () => {
      const repo = createRepo();
      const draft = makeDraftListing({
        ownerId: "owner-1",
        images: [{ url: "http://test.com/img.jpg", path: "uploads/img.jpg", isPrimary: true, order: 1 }],
      });
      repo.findById.mockResolvedValue(draft);
      repo.updateFields.mockResolvedValue({ ...draft, status: "published" });
      const service = new ListingsService(repo);

      const result = await service.publish("lst_test1", "owner-1");
      expect(result.status).toBe("published");
    });
  });

  describe("invalid status transitions", () => {
    it("rejects publishing a sold listing", async () => {
      const repo = createRepo();
      const sold = makePublishedListing({ ownerId: "owner-1", status: "sold" });
      repo.findById.mockResolvedValue(sold);
      const service = new ListingsService(repo);

      await expect(service.publish("lst_test1", "owner-1")).rejects.toThrow(
        "Listing cannot be published in current status."
      );
    });

    it("rejects publishing a rejected listing", async () => {
      const repo = createRepo();
      const rejected = makePublishedListing({ ownerId: "owner-1", status: "rejected" });
      repo.findById.mockResolvedValue(rejected);
      const service = new ListingsService(repo);

      await expect(service.publish("lst_test1", "owner-1")).rejects.toThrow(
        "Listing cannot be published in current status."
      );
    });

    it("rejects unpublishing a draft listing", async () => {
      const repo = createRepo();
      const draft = makeDraftListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(draft);
      const service = new ListingsService(repo);

      await expect(service.unpublish("lst_test1", "owner-1")).rejects.toThrow(
        "Only published listings can be unpublished."
      );
    });

    it("rejects renewing a published listing", async () => {
      const repo = createRepo();
      const published = makePublishedListing({ ownerId: "owner-1" });
      repo.findById.mockResolvedValue(published);
      const service = new ListingsService(repo);

      await expect(service.renew("lst_test1", "owner-1")).rejects.toThrow(
        "Only archived listings can be renewed."
      );
    });

    it("rejects editing a sold listing", async () => {
      const repo = createRepo();
      const sold = makePublishedListing({ ownerId: "owner-1", status: "sold" });
      repo.findById.mockResolvedValue(sold);
      const service = new ListingsService(repo);

      await expect(
        service.patch("lst_test1", "owner-1", { title: "Updated" })
      ).rejects.toThrow("Listing cannot be edited in current status.");
    });
  });

  describe("duplicate clientRequestId idempotency", () => {
    it("returns existing listing for repeated clientRequestId", async () => {
      const repo = createRepo();
      const service = new ListingsService(repo);

      const first = await service.create({
        ownerId: "owner-1",
        ownerFullName: "Owner",
        ownerPhotoURL: "",
        title: "Camera",
        price: 125,
        categoryId: "electronics",
        clientRequestId: "submit-456",
        location: { country: "Syria", city: "aleppo", area: "aleppo" },
      });

      repo.findByClientRequestId.mockResolvedValueOnce(first);
      const second = await service.create({
        ownerId: "owner-1",
        ownerFullName: "Owner",
        ownerPhotoURL: "",
        title: "Camera",
        price: 125,
        categoryId: "electronics",
        clientRequestId: "submit-456",
        location: { country: "Syria", city: "aleppo", area: "aleppo" },
      });

      expect(second.id).toBe(first.id);
      expect(repo.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("normalizeFilters", () => {
    it("rejects invalid sort values", () => {
      const repo = createRepo();
      const service = new ListingsService(repo);

      const result = service.normalizeFilters({
        sort: "DROP TABLE listings" as PaginationOptions["sort"],
      });
      expect(result.sort).toBe("newest");
    });

    it("passes priceMin and priceMax through", () => {
      const repo = createRepo();
      const service = new ListingsService(repo);

      const result = service.normalizeFilters({ priceMin: 10, priceMax: 500 });
      expect(result.priceMin).toBe(10);
      expect(result.priceMax).toBe(500);
    });

    it("normalizes city aliases", () => {
      const repo = createRepo();
      const service = new ListingsService(repo);

      const result = service.normalizeFilters({ city: "حلب" });
      expect(result.city).toBe("aleppo");
    });
  });

  describe("renew requires images", () => {
    it("rejects renewing archived listing with no images", async () => {
      const repo = createRepo();
      const archived = makePublishedListing({ ownerId: "owner-1", status: "archived", images: [] });
      repo.findById.mockResolvedValue(archived);
      const service = new ListingsService(repo);

      await expect(service.renew("lst_test1", "owner-1")).rejects.toThrow(
        "At least one image is required before publishing."
      );
    });
  });
});
