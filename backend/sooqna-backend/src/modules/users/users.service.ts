import type { DecodedIdToken } from "firebase-admin/auth";
import { nowIso } from "../../utils/time";
import { AppError } from "../../shared/errors/appError";
import type { UserProfile } from "./users.types";
import type { UsersRepository } from "./repositories/users.repository";

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async createOrUpdateProfileFromToken(
    authUser: DecodedIdToken,
    input?: Partial<Pick<UserProfile, "fullName" | "photoURL">>
  ): Promise<UserProfile> {
    if (!authUser.uid) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }

    const now = nowIso();
    const existing = await this.safeFindByUid(authUser.uid);

    const profile: UserProfile = {
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

    return this.safeUpsert(profile);
  }

  async getMe(uid: string): Promise<UserProfile | null> {
    if (!uid.trim()) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }
    return this.safeFindByUid(uid);
  }

  private async safeFindByUid(uid: string): Promise<UserProfile | null> {
    try {
      return await this.repo.findByUid(uid);
    } catch (error) {
      console.warn("UsersService.safeFindByUid fallback:", error);
      return null;
    }
  }

  private async safeUpsert(profile: UserProfile): Promise<UserProfile> {
    try {
      return await this.repo.upsert(profile);
    } catch (error) {
      console.warn("UsersService.safeUpsert fallback:", error);
      // Keep auth/profile flows working even if DB is temporarily unavailable.
      return profile;
    }
  }
}

