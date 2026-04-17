import { generateId } from "../../utils/ids";
import { nowIso } from "../../utils/time";
import { PrismaUsersRepository } from "../users/repositories/users.repository";
import type { ListingsRepository } from "./repositories/listings.repository";
import type { Listing } from "./listings.types";

type CreateListingInput = {
  ownerId: string;
  ownerFullName: string;
  ownerPhotoURL: string;
  title: string;
  price: number;
  categoryId: string;
  description?: string;
  location?: {
    country?: string;
    city?: string;
    area?: string;
  };
};

type CreateListingUserInput = {
  uid: string;
  email: string;
  fullName: string;
  photoURL: string;
};

type AttachImageInput = {
  listingId: string;
  ownerId: string;
  url: string;
  path: string;
};

export class ListingsService {
  private readonly usersRepo = new PrismaUsersRepository();

  constructor(private readonly repo: ListingsRepository) {}

  private async ensureOwnerUser(owner: CreateListingUserInput): Promise<void> {
    const existing = await this.usersRepo.findByUid(owner.uid);
    if (existing) return;
    const now = nowIso();
    await this.usersRepo.upsert({
      uid: owner.uid,
      fullName: owner.fullName,
      email: owner.email,
      photoURL: owner.photoURL,
      role: "user",
      accountStatus: "active",
      isEmailVerified: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  async create(input: CreateListingInput): Promise<Listing> {
    if (!input.title.trim()) throw new Error("title is required");
    if (!Number.isFinite(input.price) || input.price < 0)
      throw new Error("price must be non-negative");
    if (!input.categoryId.trim()) throw new Error("categoryId is required");
    await this.ensureOwnerUser({
      uid: input.ownerId,
      email: "",
      fullName: input.ownerFullName,
      photoURL: input.ownerPhotoURL,
    });

    const now = nowIso();
    const listing: Listing = {
      id: generateId("lst"),
      title: input.title.trim(),
      titleLower: input.title.trim().toLowerCase(),
      description: input.description?.trim() ?? "",
      price: input.price,
      currency: "JOD",
      priceType: "fixed",
      categoryId: input.categoryId.trim(),
      ownerId: input.ownerId,
      ownerSnapshot: {
        fullName: input.ownerFullName,
        photoURL: input.ownerPhotoURL,
      },
      location: {
        country: input.location?.country ?? "",
        city: input.location?.city ?? "",
        area: input.location?.area ?? "",
      },
      images: [],
      status: "draft",
      condition: "used",
      contactPreference: "chat",
      viewsCount: 0,
      favoritesCount: 0,
      messagesCount: 0,
      isFeatured: false,
      isApproved: false,
      publishedAt: null,
      expiresAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    return this.repo.create(listing);
  }

  async list(): Promise<Listing[]> {
    return this.repo.list();
  }

  async getById(id: string): Promise<Listing | null> {
    return this.repo.findById(id);
  }

  async patch(
    listingId: string,
    userId: string,
    patch: Partial<Pick<Listing, "title" | "description" | "price" | "status">>
  ): Promise<Listing> {
    const existing = await this.repo.findById(listingId);
    if (!existing) throw new Error("Listing not found");
    if (existing.ownerId !== userId) throw new Error("Forbidden");

    const next: Listing = {
      ...existing,
      title: patch.title?.trim() || existing.title,
      titleLower: (patch.title?.trim() || existing.title).toLowerCase(),
      description: patch.description ?? existing.description,
      price:
        patch.price !== undefined && Number.isFinite(patch.price) && patch.price >= 0
          ? patch.price
          : existing.price,
      status: patch.status ?? existing.status,
      updatedAt: nowIso(),
    };
    return this.repo.update(existing.id, next);
  }

  async softDelete(listingId: string, userId: string): Promise<Listing> {
    const existing = await this.repo.findById(listingId);
    if (!existing) throw new Error("Listing not found");
    if (existing.ownerId !== userId) throw new Error("Forbidden");

    const next: Listing = {
      ...existing,
      deletedAt: nowIso(),
      updatedAt: nowIso(),
    };
    return this.repo.update(existing.id, next);
  }

  async attachImage(input: AttachImageInput): Promise<Listing> {
    const listing = await this.repo.findById(input.listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.ownerId !== input.ownerId) throw new Error("Forbidden");

    const nextImages = [
      ...listing.images,
      {
        url: input.url,
        path: input.path,
        isPrimary: listing.images.length === 0,
        order: listing.images.length + 1,
      },
    ].map((img, idx) => ({
      ...img,
      order: idx + 1,
      isPrimary: idx === 0,
    }));

    const next: Listing = {
      ...listing,
      images: nextImages,
      updatedAt: nowIso(),
    };

    return this.repo.update(listing.id, next);
  }
}

