"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = verifyFirebaseToken;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
async function verifyFirebaseToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "Missing Bearer token." });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const decoded = await firebaseAdmin_1.adminAuth.verifyIdToken(token);
        req.authUser = decoded;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
}
