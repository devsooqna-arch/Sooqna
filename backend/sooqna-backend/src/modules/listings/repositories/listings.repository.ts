import * as path from "node:path";
import { env } from "../../../config/env";
import { prisma } from "../../../config/prisma";
import { parseIso, toIso } from "../../../shared/utils/dates";
import { readJsonArrayFile, writeJsonArrayFile } from "../../../utils/fileStore";
import type { Listing } from "../listings.types";

export type PaginationOptions = {
  limit?: number;
  offset?: number;
};

export interface ListingsRepository {
  create(listing: Listing): Promise<Listing>;
  list(pagination?: PaginationOptions): Promise<{ items: Listing[]; total: number }>;
  listByOwner(ownerId: string): Promise<Listing[]>;
  findById(id: string): Promise<Listing | null>;
  update(id: string, listing: Listing): Promise<Listing>;
}

const listingsDataPath = path.resolve(
  process.cwd(),
  "src/modules/listings/repositories/listings.data.json"
);

function useJsonFallback(): boolean {
  return env.enableCategoriesJsonFallback === "true";
}

type ListingWithImages = Awaited<ReturnType<typeof prisma.listing.findFirst>> & {
  listingImages?: Array<{ url: string; path: string; isPrimary: boolean; order: number }>;
};

function mapListing(record: ListingWithImages): Listing {
  if (!record) {
    throw new Error("Listing not found.");
  }
  const listing = record;
  return {
    id: listing.id,
    title: listing.title,
    titleLower: listing.titleLower,
    description: listing.description,
    price: listing.price,
    currency: listing.currency as "JOD",
    priceType: listing.priceType as Listing["priceType"],
    categoryId: listing.categoryId,
    ownerId: listing.ownerId ?? "",
    ownerSnapshot: {
      fullName: listing.ownerSnapshotName,
      photoURL: listing.ownerSnapshotPhotoUrl,
    },
    location: {
      country: listing.locationCountry,
      city: listing.locationCity,
      area: listing.locationArea,
    },
    images: (listing.listingImages ?? []).map((img) => ({
      url: img.url,
      path: img.path,
      isPrimary: img.isPrimary,
      order: img.order,
    })),
    status: listing.status as Listing["status"],
    condition: listing.condition as Listing["condition"],
    contactPreference: listing.contactPreference as Listing["contactPreference"],
    viewsCount: listing.viewsCount,
    favoritesCount: listing.favoritesCount,
    messagesCount: listing.messagesCount,
    isFeatured: listing.isFeatured,
    isApproved: listing.isApproved,
    publishedAt: toIso(listing.publishedAt),
    expiresAt: toIso(listing.expiresAt),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    deletedAt: toIso(listing.deletedAt),
  };
}

export class PrismaListingsRepository implements ListingsRepository {
  async create(listing: Listing): Promise<Listing> {
    try {
      const created = await prisma.listing.create({
        data: {
          id: listing.id,
          title: listing.title,
          titleLower: listing.titleLower,
          description: listing.description,
          price: listing.price,
          currency: listing.currency,
          priceType: listing.priceType,
          categoryId: listing.categoryId,
          ownerId: listing.ownerId,
          ownerSnapshotName: listing.ownerSnapshot.fullName,
          ownerSnapshotPhotoUrl: listing.ownerSnapshot.photoURL,
          locationCountry: listing.location.country,
          locationCity: listing.location.city,
          locationArea: listing.location.area,
          status: listing.status,
          condition: listing.condition,
          contactPreference: listing.contactPreference,
          viewsCount: listing.viewsCount,
          favoritesCount: listing.favoritesCount,
          messagesCount: listing.messagesCount,
          isFeatured: listing.isFeatured,
          isApproved: listing.isApproved,
          publishedAt: parseIso(listing.publishedAt),
          expiresAt: parseIso(listing.expiresAt),
          createdAt: new Date(listing.createdAt),
          updatedAt: new Date(listing.updatedAt),
          deletedAt: parseIso(listing.deletedAt),
          listingImages: {
            create: listing.images.map((image) => ({
              url: image.url,
              path: image.path,
              isPrimary: image.isPrimary,
              order: image.order,
            })),
          },
        },
        include: { listingImages: { orderBy: { order: "asc" } } },
      });
      return mapListing(created);
    } catch (error) {
      if (useJsonFallback()) {
        const listings = readJsonArrayFile<Listing>(listingsDataPath);
        listings.push(listing);
        writeJsonArrayFile(listingsDataPath, listings);
        return listing;
      }
      throw new Error("Failed to create listing.", { cause: error });
    }
  }

  async list(pagination?: PaginationOptions): Promise<{ items: Listing[]; total: number }> {
    const limit = Math.min(pagination?.limit ?? 20, 100);
    const offset = pagination?.offset ?? 0;
    try {
      const [listings, total] = await prisma.$transaction([
        prisma.listing.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          include: { listingImages: { orderBy: { order: "asc" } } },
          take: limit,
          skip: offset,
        }),
        prisma.listing.count({ where: { deletedAt: null } }),
      ]);
      return { items: listings.map(mapListing), total };
    } catch (error) {
      if (useJsonFallback()) {
        const all = readJsonArrayFile<Listing>(listingsDataPath);
        const filtered = all
          .filter((listing) => listing.deletedAt === null)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return { items: filtered.slice(offset, offset + limit), total: filtered.length };
      }
      throw new Error("Failed to list listings.", { cause: error });
    }
  }

  async listByOwner(ownerId: string): Promise<Listing[]> {
    try {
      const listings = await prisma.listing.findMany({
        where: { deletedAt: null, ownerId },
        orderBy: { createdAt: "desc" },
        include: { listingImages: { orderBy: { order: "asc" } } },
      });
      return listings.map(mapListing);
    } catch (error) {
      if (useJsonFallback()) {
        const listings = readJsonArrayFile<Listing>(listingsDataPath);
        return listings
          .filter((listing) => listing.deletedAt === null && listing.ownerId === ownerId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      throw new Error("Failed to list owner listings.", { cause: error });
    }
  }

  async findById(id: string): Promise<Listing | null> {
    try {
      const listing = await prisma.listing.findFirst({
        where: { id, deletedAt: null },
        include: { listingImages: { orderBy: { order: "asc" } } },
      });
      return listing ? mapListing(listing) : null;
    } catch (error) {
      if (useJsonFallback()) {
        const listings = readJsonArrayFile<Listing>(listingsDataPath);
        const listing = listings.find((item) => item.id === id && item.deletedAt === null);
        return listing ?? null;
      }
      throw new Error("Failed to fetch listing.", { cause: error });
    }
  }

  async update(id: string, listing: Listing): Promise<Listing> {
    try {
      await prisma.listingImage.deleteMany({ where: { listingId: id } });
      const updated = await prisma.listing.update({
        where: { id },
        data: {
          title: listing.title,
          titleLower: listing.titleLower,
          description: listing.description,
          price: listing.price,
          currency: listing.currency,
          priceType: listing.priceType,
          categoryId: listing.categoryId,
          ownerId: listing.ownerId,
          ownerSnapshotName: listing.ownerSnapshot.fullName,
          ownerSnapshotPhotoUrl: listing.ownerSnapshot.photoURL,
          locationCountry: listing.location.country,
          locationCity: listing.location.city,
          locationArea: listing.location.area,
          status: listing.status,
          condition: listing.condition,
          contactPreference: listing.contactPreference,
          viewsCount: listing.viewsCount,
          favoritesCount: listing.favoritesCount,
          messagesCount: listing.messagesCount,
          isFeatured: listing.isFeatured,
          isApproved: listing.isApproved,
          publishedAt: parseIso(listing.publishedAt),
          expiresAt: parseIso(listing.expiresAt),
          createdAt: new Date(listing.createdAt),
          updatedAt: new Date(listing.updatedAt),
          deletedAt: parseIso(listing.deletedAt),
          listingImages: {
            create: listing.images.map((image) => ({
              url: image.url,
              path: image.path,
              isPrimary: image.isPrimary,
              order: image.order,
            })),
          },
        },
        include: { listingImages: { orderBy: { order: "asc" } } },
      });
      return mapListing(updated);
    } catch (error) {
      if (useJsonFallback()) {
        const listings = readJsonArrayFile<Listing>(listingsDataPath);
        const idx = listings.findIndex((item) => item.id === id);
        if (idx < 0) throw new Error("Listing not found.");
        listings[idx] = listing;
        writeJsonArrayFile(listingsDataPath, listings);
        return listing;
      }
      throw new Error("Listing not found.", { cause: error });
    }
  }
}

