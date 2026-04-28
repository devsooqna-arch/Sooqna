import { generateId } from "../../utils/ids";
import { nowIso } from "../../utils/time";
import { AppError } from "../../shared/errors/appError";
import { env } from "../../config/env";
import { CATEGORY_IDS, CITY_IDS } from "../../shared/constants/domain";
import { PrismaUsersRepository } from "../users/repositories/users.repository";
import { trackEngagementEvent } from "../engagement/engagement.service";
import type { ListingsRepository, PaginationOptions } from "./repositories/listings.repository";
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
  private readonly cityAliases: Record<string, string> = {
    amman: "amman",
    "عمّان": "amman",
    "عمان": "amman",
    zarqa: "zarqa",
    "الزرقاء": "zarqa",
    irbid: "irbid",
    "إربد": "irbid",
    "اربد": "irbid",
    aqaba: "aqaba",
    "العقبة": "aqaba",
    salt: "salt",
    "السلط": "salt",
    madaba: "madaba",
    "مادبا": "madaba",
    karak: "karak",
    "الكرك": "karak",
    jerash: "jerash",
    "جرش": "jerash",
  };

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
    if (!input.title.trim()) throw new AppError(400, "title is required", "VALIDATION_ERROR");
    if (!Number.isFinite(input.price) || input.price < 0)
      throw new AppError(400, "price must be non-negative", "VALIDATION_ERROR");
    if (!input.categoryId.trim())
      throw new AppError(400, "categoryId is required", "VALIDATION_ERROR");
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

  async list(pagination?: PaginationOptions): Promise<{ items: Listing[]; total: number }> {
    const normalized = this.normalizeFilters(pagination);
    const result = await this.repo.list(normalized);
    return result;
  }

  async listForOwner(ownerId: string): Promise<Listing[]> {
    if (!ownerId.trim()) {
      throw new AppError(400, "ownerId is required", "VALIDATION_ERROR");
    }
    return this.repo.listByOwner(ownerId);
  }

  async getById(id: string): Promise<Listing | null> {
    return this.repo.findById(id);
  }

  async recordView(listingId: string, viewerId?: string): Promise<Listing | null> {
    const listing = await this.repo.findById(listingId);
    if (!listing) return null;
    const next: Listing = {
      ...listing,
      viewsCount: Math.max(0, listing.viewsCount) + 1,
      updatedAt: nowIso(),
    };
    const updated = await this.repo.update(listingId, next);
    await trackEngagementEvent({
      eventType: "view",
      listingId,
      actorId: viewerId,
    });
    return updated;
  }

  async patch(
    listingId: string,
    userId: string,
    patch: Partial<Pick<Listing, "title" | "description" | "price">>
  ): Promise<Listing> {
    const existing = await this.repo.findById(listingId);
    if (!existing) throw new AppError(404, "Listing not found", "NOT_FOUND");
    if (existing.ownerId !== userId) throw new AppError(403, "Forbidden", "FORBIDDEN");
    this.applyAutoExpiration(existing);
    if (existing.status === "sold" || existing.status === "rejected") {
      throw new AppError(400, "Listing cannot be edited in current status.", "LISTING_STATE_INVALID");
    }

    const next: Listing = {
      ...existing,
      title: patch.title?.trim() || existing.title,
      titleLower: (patch.title?.trim() || existing.title).toLowerCase(),
      description: patch.description ?? existing.description,
      price:
        patch.price !== undefined && Number.isFinite(patch.price) && patch.price >= 0
          ? patch.price
          : existing.price,
      updatedAt: nowIso(),
    };
    return this.repo.update(existing.id, next);
  }

  async softDelete(listingId: string, userId: string): Promise<Listing> {
    const existing = await this.repo.findById(listingId);
    if (!existing) throw new AppError(404, "Listing not found", "NOT_FOUND");
    if (existing.ownerId !== userId) throw new AppError(403, "Forbidden", "FORBIDDEN");

    const next: Listing = {
      ...existing,
      deletedAt: nowIso(),
      updatedAt: nowIso(),
    };
    return this.repo.update(existing.id, next);
  }

  async attachImage(input: AttachImageInput): Promise<Listing> {
    const listing = await this.repo.findById(input.listingId);
    if (!listing) throw new AppError(404, "Listing not found", "NOT_FOUND");
    if (listing.ownerId !== input.ownerId) throw new AppError(403, "Forbidden", "FORBIDDEN");
    this.applyAutoExpiration(listing);
    if (listing.status === "sold" || listing.status === "rejected") {
      throw new AppError(
        400,
        "Listing images cannot be updated in current status.",
        "LISTING_STATE_INVALID"
      );
    }

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

  async publish(listingId: string, ownerId: string): Promise<Listing> {
    const listing = await this.getOwnerListingOrThrow(listingId, ownerId);
    this.applyAutoExpiration(listing);
    if (listing.status === "published") {
      throw new AppError(400, "Listing is already published.", "LISTING_STATE_INVALID");
    }
    if (listing.status === "sold" || listing.status === "rejected") {
      throw new AppError(400, "Listing cannot be published in current status.", "LISTING_STATE_INVALID");
    }
    if (listing.images.length === 0) {
      throw new AppError(400, "At least one image is required before publishing.", "VALIDATION_ERROR");
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + env.listingDefaultExpiryDays);

    const next: Listing = {
      ...listing,
      status: "published",
      isApproved: true,
      publishedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      updatedAt: now.toISOString(),
    };
    return this.repo.update(listing.id, next);
  }

  async unpublish(listingId: string, ownerId: string): Promise<Listing> {
    const listing = await this.getOwnerListingOrThrow(listingId, ownerId);
    this.applyAutoExpiration(listing);
    if (listing.status !== "published") {
      throw new AppError(400, "Only published listings can be unpublished.", "LISTING_STATE_INVALID");
    }
    const next: Listing = {
      ...listing,
      status: "archived",
      updatedAt: nowIso(),
    };
    return this.repo.update(listing.id, next);
  }

  async renew(listingId: string, ownerId: string, durationDays?: number): Promise<Listing> {
    const listing = await this.getOwnerListingOrThrow(listingId, ownerId);
    this.applyAutoExpiration(listing);
    if (listing.status !== "archived") {
      throw new AppError(400, "Only archived listings can be renewed.", "LISTING_STATE_INVALID");
    }
    const effectiveDays =
      typeof durationDays === "number" && durationDays >= 1 && durationDays <= 365
        ? durationDays
        : env.listingRenewDays;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + effectiveDays);

    const next: Listing = {
      ...listing,
      status: "published",
      publishedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      updatedAt: now.toISOString(),
    };
    return this.repo.update(listing.id, next);
  }

  async expire(listingId: string, ownerId: string): Promise<Listing> {
    const listing = await this.getOwnerListingOrThrow(listingId, ownerId);
    this.applyAutoExpiration(listing);
    if (listing.status !== "published") {
      throw new AppError(400, "Only published listings can be expired.", "LISTING_STATE_INVALID");
    }
    const now = nowIso();
    const next: Listing = {
      ...listing,
      status: "archived",
      expiresAt: now,
      updatedAt: now,
    };
    return this.repo.update(listing.id, next);
  }

  private async getOwnerListingOrThrow(listingId: string, ownerId: string): Promise<Listing> {
    const listing = await this.repo.findById(listingId);
    if (!listing) throw new AppError(404, "Listing not found", "NOT_FOUND");
    if (listing.ownerId !== ownerId) throw new AppError(403, "Forbidden", "FORBIDDEN");
    return listing;
  }

  private applyAutoExpiration(listing: Listing): void {
    if (listing.status !== "published" || !listing.expiresAt) return;
    if (new Date(listing.expiresAt).getTime() > Date.now()) return;
    listing.status = "archived";
    listing.updatedAt = nowIso();
  }

  normalizeFilters(pagination?: PaginationOptions): PaginationOptions {
    const categoryInput = pagination?.category?.trim().toLowerCase() ?? "";
    const cityInput = pagination?.city?.trim().toLowerCase() ?? "";
    const category = CATEGORY_IDS.includes(categoryInput as (typeof CATEGORY_IDS)[number])
      ? categoryInput
      : undefined;
    const cityAlias = this.cityAliases[cityInput];
    const city = cityAlias && CITY_IDS.includes(cityAlias as (typeof CITY_IDS)[number]) ? cityAlias : undefined;
    const sort =
      pagination?.sort === "price_asc" || pagination?.sort === "price_desc" || pagination?.sort === "newest"
        ? pagination.sort
        : "newest";

    return {
      limit: pagination?.limit,
      offset: pagination?.offset,
      category,
      city,
      search: pagination?.search?.trim() || undefined,
      sort,
    };
  }
}

