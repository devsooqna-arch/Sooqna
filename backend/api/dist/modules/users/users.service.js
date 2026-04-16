"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const time_1 = require("../../utils/time");
class UsersService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createOrUpdateProfileFromToken(authUser, input) {
        const now = (0, time_1.nowIso)();
        const existing = await this.repo.findByUid(authUser.uid);
        const profile = {
            uid: authUser.uid,
            fullName: input?.fullName ?? existing?.fullName ?? authUser.name ?? "",
            email: authUser.email ?? existing?.email ?? "",
            photoURL: input?.photoURL ?? existing?.photoURL ?? authUser.picture ?? "",
            role: "user",
            accountStatus: "active",
            isEmailVerified: authUser.email_verified ?? false,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        };
        return this.repo.upsert(profile);
    }
    async getMe(uid) {
        return this.repo.findByUid(uid);
    }
}
exports.UsersService = UsersService;
