"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
});
