import * as path from "node:path";
import { env } from "../../../config/env";
import { prisma } from "../../../config/prisma";
import { readJsonArrayFile, writeJsonArrayFile } from "../../../utils/fileStore";
import type { UserProfile } from "../users.types";

export interface UsersRepository {
  findByUid(uid: string): Promise<UserProfile | null>;
  upsert(profile: UserProfile): Promise<UserProfile>;
}

const usersDataPath = path.resolve(
  process.cwd(),
  "src/modules/users/repositories/users.data.json"
);

function useJsonFallback(): boolean {
  return env.enableCategoriesJsonFallback === "true";
}

export class PrismaUsersRepository implements UsersRepository {
  async findByUid(uid: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { firebaseUid: uid },
      });
      if (!user) return null;
      return {
        uid: user.firebaseUid,
        fullName: user.name,
        email: user.email,
        photoURL: user.avatarUrl ?? "",
        role: user.role as UserProfile["role"],
        accountStatus: user.accountStatus as UserProfile["accountStatus"],
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch {
      if (useJsonFallback()) {
        const users = readJsonArrayFile<UserProfile>(usersDataPath);
        return users.find((user) => user.uid === uid) ?? null;
      }
      throw new Error("Failed to fetch user profile.");
    }
  }

  async upsert(profile: UserProfile): Promise<UserProfile> {
    try {
      const user = await prisma.user.upsert({
        where: { firebaseUid: profile.uid },
        update: {
          email: profile.email,
          name: profile.fullName,
          avatarUrl: profile.photoURL,
          role: profile.role,
          accountStatus: profile.accountStatus,
          isEmailVerified: profile.isEmailVerified,
          updatedAt: new Date(profile.updatedAt),
        },
        create: {
          id: profile.uid,
          firebaseUid: profile.uid,
          email: profile.email,
          name: profile.fullName,
          avatarUrl: profile.photoURL,
          role: profile.role,
          accountStatus: profile.accountStatus,
          isEmailVerified: profile.isEmailVerified,
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt),
        },
      });
      return {
        uid: user.firebaseUid,
        fullName: user.name,
        email: user.email,
        photoURL: user.avatarUrl ?? "",
        role: user.role as UserProfile["role"],
        accountStatus: user.accountStatus as UserProfile["accountStatus"],
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch {
      if (useJsonFallback()) {
        const users = readJsonArrayFile<UserProfile>(usersDataPath);
        const idx = users.findIndex((item) => item.uid === profile.uid);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...profile };
        } else {
          users.push(profile);
        }
        writeJsonArrayFile(usersDataPath, users);
        return profile;
      }
      throw new Error("Failed to save user profile.");
    }
  }
}

