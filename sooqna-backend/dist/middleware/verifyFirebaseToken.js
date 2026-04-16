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
    try {
        req.authUser = await firebaseAdmin_1.adminAuth.verifyIdToken(authHeader.slice(7));
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
}
