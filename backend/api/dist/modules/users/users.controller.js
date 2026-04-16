"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertProfile = upsertProfile;
exports.getMe = getMe;
const users_repository_1 = require("./repositories/users.repository");
const users_service_1 = require("./users.service");
const service = new users_service_1.UsersService(new users_repository_1.FileUsersRepository());
async function upsertProfile(req, res) {
    if (!req.authUser) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const fullName = typeof req.body?.fullName === "string" ? req.body.fullName : undefined;
    const photoURL = typeof req.body?.photoURL === "string" ? req.body.photoURL : undefined;
    const profile = await service.createOrUpdateProfileFromToken(req.authUser, {
        fullName,
        photoURL,
    });
    res.json({ success: true, profile });
}
async function getMe(req, res) {
    if (!req.authUser) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    const profile = await service.getMe(req.authUser.uid);
    res.json({ success: true, profile });
}
