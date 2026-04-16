"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsService = void 0;
const ids_1 = require("../../utils/ids");
const time_1 = require("../../utils/time");
class ListingsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(input) {
        if (!input.title.trim())
            throw new Error("title is required");
        if (!Number.isFinite(input.price) || input.price < 0)
            throw new Error("price must be non-negative");
        if (!input.categoryId.trim())
            throw new Error("categoryId is required");
        const now = (0, time_1.nowIso)();
        const listing = {
            id: (0, ids_1.generateId)("lst"),
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
    async list() {
        return this.repo.list();
    }
    async getById(id) {
        return this.repo.findById(id);
    }
    async patch(listingId, userId, patch) {
        const existing = await this.repo.findById(listingId);
        if (!existing)
            throw new Error("Listing not found");
        if (existing.ownerId !== userId)
            throw new Error("Forbidden");
        const next = {
            ...existing,
            title: patch.title?.trim() || existing.title,
            titleLower: (patch.title?.trim() || existing.title).toLowerCase(),
            description: patch.description ?? existing.description,
            price: patch.price !== undefined && Number.isFinite(patch.price) && patch.price >= 0
                ? patch.price
                : existing.price,
            status: patch.status ?? existing.status,
            updatedAt: (0, time_1.nowIso)(),
        };
        return this.repo.update(existing.id, next);
    }
    async softDelete(listingId, userId) {
        const existing = await this.repo.findById(listingId);
        if (!existing)
            throw new Error("Listing not found");
        if (existing.ownerId !== userId)
            throw new Error("Forbidden");
        const next = {
            ...existing,
            deletedAt: (0, time_1.nowIso)(),
            updatedAt: (0, time_1.nowIso)(),
        };
        return this.repo.update(existing.id, next);
    }
    async attachImage(input) {
        const listing = await this.repo.findById(input.listingId);
        if (!listing)
            throw new Error("Listing not found");
        if (listing.ownerId !== input.ownerId)
            throw new Error("Forbidden");
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
        const next = {
            ...listing,
            images: nextImages,
            updatedAt: (0, time_1.nowIso)(),
        };
        return this.repo.update(listing.id, next);
    }
}
exports.ListingsService = ListingsService;
