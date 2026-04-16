"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const time_1 = require("../../utils/time");
class FavoritesService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async add(userId, listingId) {
        await this.repo.upsert({ userId, listingId, createdAt: (0, time_1.nowIso)() });
    }
    async remove(userId, listingId) {
        await this.repo.remove(userId, listingId);
    }
    async list(userId) {
        const records = await this.repo.listByUser(userId);
        return records.map((record) => record.listingId);
    }
}
exports.FavoritesService = FavoritesService;
