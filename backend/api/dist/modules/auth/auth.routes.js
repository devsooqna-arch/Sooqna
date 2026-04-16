"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const verifyFirebaseToken_1 = require("../../middleware/verifyFirebaseToken");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.get("/session", verifyFirebaseToken_1.verifyFirebaseToken, (req, res) => {
    res.json({
        success: true,
        user: {
            uid: req.authUser?.uid ?? null,
            email: req.authUser?.email ?? null,
        },
    });
});
