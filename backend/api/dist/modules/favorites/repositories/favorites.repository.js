"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileFavoritesRepository = void 0;
const path = __importStar(require("node:path"));
const fileStore_1 = require("../../../utils/fileStore");
const dbPath = path.resolve(process.cwd(), "src/modules/favorites/repositories/favorites.data.json");
class FileFavoritesRepository {
    async listByUser(userId) {
        const items = (0, fileStore_1.readJsonArrayFile)(dbPath);
        return items.filter((item) => item.userId === userId);
    }
    async upsert(record) {
        const items = (0, fileStore_1.readJsonArrayFile)(dbPath);
        const idx = items.findIndex((item) => item.userId === record.userId && item.listingId === record.listingId);
        if (idx >= 0)
            items[idx] = record;
        else
            items.push(record);
        (0, fileStore_1.writeJsonArrayFile)(dbPath, items);
    }
    async remove(userId, listingId) {
        const items = (0, fileStore_1.readJsonArrayFile)(dbPath);
        const next = items.filter((item) => !(item.userId === userId && item.listingId === listingId));
        (0, fileStore_1.writeJsonArrayFile)(dbPath, next);
    }
}
exports.FileFavoritesRepository = FileFavoritesRepository;
