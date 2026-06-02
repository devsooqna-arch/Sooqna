import { createConversationBodySchema } from "./schemas";

describe("createConversationBodySchema", () => {
  it("accepts the minimal trusted conversation creation payload", () => {
    const parsed = createConversationBodySchema.safeParse({
      listingId: "listing-1",
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts legacy ignored participant snapshots with blank photo URLs", () => {
    const parsed = createConversationBodySchema.safeParse({
      listingId: "listing-1",
      participantIds: ["buyer-1", "seller-1"],
      participants: {
        "buyer-1": {
          fullName: "Buyer One",
          photoURL: "",
        },
        "seller-1": {
          fullName: "Seller One",
          photoURL: "",
        },
      },
      listingSnapshot: {
        title: "Camera",
        primaryImageURL: "",
      },
      createdBy: "buyer-1",
    });

    expect(parsed.success).toBe(true);
  });
});
