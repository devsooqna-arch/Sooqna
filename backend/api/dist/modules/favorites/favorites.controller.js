"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
exports.listFavorites = listFavorites;
const favorites_repository_1 = require("./repositories/favorites.repository");
const favorites_service_1 = require("./favorites.service");
const service = new favorites_service_1.FavoritesService(new favorites_repository_1.FileFavoritesRepository());
async function addFavorite(req, res) {
    const uid = req.authUser?.uid;
    if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    await service.add(uid, req.params.listingId);
    res.json({ success: true });
}
async function removeFavorite(req, res) {
    const uid = req.authUser?.uid;
    if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    await service.remove(uid, req.params.listingId);
    res.json({ success: true });
}
async function listFavorites(req, res) {
    const uid = req.authUser?.uid;
    if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const listingIds = await service.list(uid);
    res.json({ success: true, listingIds });
}
