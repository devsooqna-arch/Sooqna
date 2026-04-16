"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const verifyFirebaseToken_1 = require("../../middleware/verifyFirebaseToken");
const users_controller_1 = require("./users.controller");
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.post("/profile", verifyFirebaseToken_1.verifyFirebaseToken, users_controller_1.upsertProfile);
exports.usersRouter.get("/me", verifyFirebaseToken_1.verifyFirebaseToken, users_controller_1.getMe);
