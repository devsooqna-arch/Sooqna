import type { DecodedIdToken } from "firebase-admin/auth";
import { nowIso } from "../../utils/time";
import { AppError } from "../../shared/errors/appError";
import type { UserProfile } from "./users.types";
import type { UsersRepository } from "./repositories/users.repository";

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  private buildProfile(
    authUser: DecodedIdToken,
    existing: UserProfile | null,
    input?: Partial<Pick<UserProfile, "fullName" | "photoURL">>
  ): UserProfile {
    const now = nowIso();
    return {
      uid: authUser.uid,
      fullName: input?.fullName ?? existing?.fullName ?? authUser.name ?? "",
      email: authUser.email ?? existing?.email ?? "",
      photoURL: input?.photoURL ?? existing?.photoURL ?? authUser.picture ?? "",
      role: existing?.role ?? "user",
      accountStatus: existing?.accountStatus ?? "active",
      isEmailVerified: authUser.email_verified ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
  }

  async createOrUpdateProfileFromToken(
    authUser: DecodedIdToken,
    input?: Partial<Pick<UserProfile, "fullName" | "photoURL">>
  ): Promise<UserProfile> {
    if (!authUser.uid) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }

    const existing = await this.safeFindByUid(authUser.uid);
    const profile = this.buildProfile(authUser, existing, input);
    return this.safeUpsert(profile);
  }

  async patchProfileFromToken(
    authUser: DecodedIdToken,
    input: Partial<Pick<UserProfile, "fullName" | "photoURL">>
  ): Promise<UserProfile> {
    if (!authUser.uid) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }
    const existing = await this.safeFindByUid(authUser.uid);
    const profile = this.buildProfile(authUser, existing, {
      fullName: input.fullName ?? existing?.fullName ?? authUser.name ?? "",
      photoURL: input.photoURL ?? existing?.photoURL ?? authUser.picture ?? "",
    });
    return this.safeUpsert(profile);
  }

  async getMe(uid: string): Promise<UserProfile | null> {
    if (!uid.trim()) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }
    return this.safeFindByUid(uid);
  }

  async getOrCreateMe(authUser: DecodedIdToken): Promise<UserProfile> {
    if (!authUser.uid) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }
    const existing = await this.safeFindByUid(authUser.uid);
    if (existing) {
      // Keep verification status in sync with latest token claims.
      const nextProfile = {
        ...existing,
        email: authUser.email ?? existing.email,
        isEmailVerified: authUser.email_verified ?? false,
        updatedAt: nowIso(),
      };
      return this.safeUpsert(nextProfile);
    }
    return this.createOrUpdateProfileFromToken(authUser);
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

