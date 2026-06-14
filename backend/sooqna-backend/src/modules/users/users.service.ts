import type { DecodedIdToken } from "firebase-admin/auth";
import { nowIso } from "../../utils/time";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/appError";
import type { UserProfile } from "./users.types";
import type { UsersRepository } from "./repositories/users.repository";

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  /**
   * Promote configured bootstrap emails to ADMIN. Only ever promotes — never
   * demotes — so removing an email from ADMIN_EMAILS does not strip access
   * (use the admin dashboard to change roles down).
   */
  private resolveRole(email: string, currentRole: UserProfile["role"]): UserProfile["role"] {
    if (email && env.adminEmails.includes(email.trim().toLowerCase())) {
      return "ADMIN";
    }
    return currentRole;
  }

  private buildProfile(
    authUser: DecodedIdToken,
    existing: UserProfile | null,
    input?: Partial<Pick<UserProfile, "fullName" | "photoURL">>
  ): UserProfile {
    const now = nowIso();
    const lastLoginAt = typeof authUser.auth_time === "number" ? new Date(authUser.auth_time * 1000).toISOString() : now;
    return {
      uid: authUser.uid,
      id: existing?.id ?? authUser.uid,
      fullName: input?.fullName ?? existing?.fullName ?? authUser.name ?? "",
      email: authUser.email ?? existing?.email ?? "",
      photoURL: input?.photoURL ?? existing?.photoURL ?? authUser.picture ?? "",
      role: this.resolveRole(authUser.email ?? existing?.email ?? "", existing?.role ?? "BUYER"),
      accountStatus: existing?.accountStatus ?? "active",
      isEmailVerified: authUser.email_verified ?? false,
      lastLoginAt,
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

    const existing = await this.findByUidOrThrow(authUser.uid);
    const profile = this.buildProfile(authUser, existing, input);
    return this.upsertOrThrow(profile);
  }

  async patchProfileFromToken(
    authUser: DecodedIdToken,
    input: Partial<Pick<UserProfile, "fullName" | "photoURL">>
  ): Promise<UserProfile> {
    if (!authUser.uid) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }
    const existing = await this.findByUidOrThrow(authUser.uid);
    const profile = this.buildProfile(authUser, existing, {
      fullName: input.fullName ?? existing?.fullName ?? authUser.name ?? "",
      photoURL: input.photoURL ?? existing?.photoURL ?? authUser.picture ?? "",
    });
    return this.upsertOrThrow(profile);
  }

  async getMe(uid: string): Promise<UserProfile | null> {
    if (!uid.trim()) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }
    return this.findByUidOrThrow(uid);
  }

  async getOrCreateMe(authUser: DecodedIdToken): Promise<UserProfile> {
    if (!authUser.uid) {
      throw new AppError(400, "uid is required", "VALIDATION_ERROR");
    }
    const existing = await this.findByUidOrThrow(authUser.uid);
    if (existing) {
      // Keep verification status in sync with latest token claims.
      const nextProfile = {
        ...existing,
        email: authUser.email ?? existing.email,
        role: this.resolveRole(authUser.email ?? existing.email, existing.role),
        isEmailVerified: authUser.email_verified ?? false,
        lastLoginAt: typeof authUser.auth_time === "number" ? new Date(authUser.auth_time * 1000).toISOString() : nowIso(),
        updatedAt: nowIso(),
      };
      return this.upsertOrThrow(nextProfile);
    }
    return this.createOrUpdateProfileFromToken(authUser);
  }

  private async findByUidOrThrow(uid: string): Promise<UserProfile | null> {
    try {
      return await this.repo.findByUid(uid);
    } catch (error) {
      throw new AppError(
        503,
        "User identity storage is unavailable.",
        "USER_LOOKUP_FAILED",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async upsertOrThrow(profile: UserProfile): Promise<UserProfile> {
    try {
      return await this.repo.upsert(profile);
    } catch (error) {
      throw new AppError(
        503,
        "User identity sync failed.",
        "USER_SYNC_FAILED",
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

