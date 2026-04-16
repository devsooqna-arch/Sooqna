"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListing = createListing;
exports.listListings = listListings;
exports.getListingById = getListingById;
exports.patchListing = patchListing;
exports.deleteListing = deleteListing;
exports.attachListingImage = attachListingImage;
const listings_repository_1 = require("./repositories/listings.repository");
const listings_service_1 = require("./listings.service");
const service = new listings_service_1.ListingsService(new listings_repository_1.FileListingsRepository());
async function createListing(req, res) {
    if (!req.authUser) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    try {
        const listing = await service.create({
            ownerId: req.authUser.uid,
            ownerFullName: req.authUser.name ?? "",
            ownerPhotoURL: req.authUser.picture ?? "",
            title: String(req.body?.title ?? ""),
            price: Number(req.body?.price),
            categoryId: String(req.body?.categoryId ?? ""),
            description: typeof req.body?.description === "string" ? req.body.description : "",
            location: {
                country: String(req.body?.location?.country ?? ""),
                city: String(req.body?.location?.city ?? ""),
                area: String(req.body?.location?.area ?? ""),
            },
        });
        res.status(201).json({ success: true, listing });
    }
    catch (error) {
        res.status(400).json({ success: false, message: String(error.message) });
    }
}
async function listListings(_req, res) {
    const listings = await service.list();
    res.json({ success: true, listings });
}
async function getListingById(req, res) {
    const listing = await service.getById(req.params.id);
    if (!listing) {
        res.status(404).json({ success: false, message: "Listing not found" });
        return;
    }
    res.json({ success: true, listing });
}
async function patchListing(req, res) {
    if (!req.authUser) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    try {
        const listing = await service.patch(req.params.id, req.authUser.uid, {
            title: req.body?.title,
            description: req.body?.description,
            price: req.body?.price,
            status: req.body?.status,
        });
        res.json({ success: true, listing });
    }
    catch (error) {
        const message = error.message;
        res.status(message === "Forbidden" ? 403 : 400).json({ success: false, message });
    }
}
async function deleteListing(req, res) {
    if (!req.authUser) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    try {
        const listing = await service.softDelete(req.params.id, req.authUser.uid);
        res.json({ success: true, listing });
    }
    catch (error) {
        const message = error.message;
        res.status(message === "Forbidden" ? 403 : 400).json({ success: false, message });
    }
}
async function attachListingImage(req, res) {
    if (!req.authUser) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const url = String(req.body?.url ?? "");
    const imagePath = String(req.body?.path ?? "");
    if (!url || !imagePath) {
        res.status(400).json({ success: false, message: "url and path are required." });
        return;
    }
    try {
        const listing = await service.attachImage({
            listingId: req.params.id,
            ownerId: req.authUser.uid,
            url,
            path: imagePath,
        });
        res.json({ success: true, listing });
    }
    catch (error) {
        const message = error.message;
        res.status(message === "Forbidden" ? 403 : 400).json({ success: false, message });
    }
}
