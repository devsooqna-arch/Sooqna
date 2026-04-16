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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageUploader = createImageUploader;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const node_crypto_1 = require("node:crypto");
const multer_1 = __importDefault(require("multer"));
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
function sanitizeFileName(name) {
    return name.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
}
function createImageUploader(folderType) {
    const storage = multer_1.default.diskStorage({
        destination: (req, _file, cb) => {
            const userId = req.authUser?.uid;
            if (!userId) {
                cb(new Error("Unauthorized"), "");
                return;
            }
            const dir = path.resolve(process.cwd(), "uploads", folderType, userId);
            ensureDir(dir);
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || "").toLowerCase();
            const safeBase = sanitizeFileName(path.basename(file.originalname, ext) || "image");
            const name = `${Date.now()}_${(0, node_crypto_1.randomBytes)(4).toString("hex")}_${safeBase}${ext}`;
            cb(null, name);
        },
    });
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!allowedMimeTypes.has(file.mimetype)) {
                cb(new Error("Only jpg/jpeg/png/webp images are allowed."));
                return;
            }
            cb(null, true);
        },
    });
}
