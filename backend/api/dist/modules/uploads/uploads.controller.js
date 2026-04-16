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
exports.uploadListingImage = uploadListingImage;
const path = __importStar(require("node:path"));
const env_1 = require("../../config/env");
function toPublicUrl(relativePath) {
    const normalized = relativePath.replace(/\\/g, "/");
    const base = env_1.env.uploadsPublicBaseUrl.replace(/\/$/, "");
    return `${base}/${normalized.replace(/^uploads\//, "")}`;
}
async function uploadListingImage(req, res) {
    const file = req.file;
    const userId = req.authUser?.uid;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    if (!file) {
        res.status(400).json({ success: false, message: "Image file is required." });
        return;
    }
    const relativePath = path
        .relative(process.cwd(), file.path)
        .replace(/\\/g, "/")
        .replace(/^\.?\//, "");
    res.json({
        success: true,
        url: toPublicUrl(relativePath),
        path: relativePath,
        filename: file.filename,
        size: file.size,
    });
}
