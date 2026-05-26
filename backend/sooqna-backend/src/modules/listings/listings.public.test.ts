import { toPublicListing, type Listing } from "./listings.types";

function makeListing(overrides?: Partial<Listing>): Listing {
  return {
    id: "lst_public",
    title: "Public camera",
    titleLower: "public camera",
    clientRequestId: "request-123",
    description: "Safe listing",
    price: 100,
    currency: "SYP",
    priceType: "fixed",
    categoryId: "electronics",
    ownerId: "firebase-private-uid",
    ownerSnapshot: { fullName: "Seller", photoURL: "https://cdn.example.com/seller.jpg" },
    location: { country: "Syria", city: "aleppo", area: "aleppo" },
    images: [
      {
        url: "https://cdn.example.com/uploads/listings/user/photo.webp",
        path: "uploads/listings/user/photo.webp",
        isPrimary: true,
        order: 1,
      },
    ],
    status: "published",
    condition: "used",
    contactPreference: "chat",
    viewsCount: 10,
    favoritesCount: 2,
    messagesCount: 1,
    isFeatured: false,
    isApproved: true,
    publishedAt: "2026-01-01T00:00:00.000Z",
    soldAt: null,
    archivedAt: null,
    expiresAt: "2026-02-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    deletedAt: null,
    ...overrides,
  };
}

describe("public listing serialization", () => {
  it("does not expose upload storage paths or moderation-only fields", () => {
    const publicListing = toPublicListing(makeListing());

    expect(publicListing).not.toHaveProperty("deletedAt");
    expect(publicListing).not.toHaveProperty("isApproved");
    expect(publicListing.images[0]).not.toHaveProperty("path");
  });
});
