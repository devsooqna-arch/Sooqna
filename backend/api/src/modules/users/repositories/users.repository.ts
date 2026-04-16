import * as path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "../../../utils/fileStore";
import type { UserProfile } from "../users.types";

export interface UsersRepository {
  findByUid(uid: string): Promise<UserProfile | null>;
  upsert(profile: UserProfile): Promise<UserProfile>;
}

const dbPath = path.resolve(process.cwd(), "src/modules/users/repositories/users.data.json");

export class FileUsersRepository implements UsersRepository {
  async findByUid(uid: string): Promise<UserProfile | null> {
    const users = readJsonArrayFile<UserProfile>(dbPath);
    return users.find((u) => u.uid === uid) ?? null;
  }

  async upsert(profile: UserProfile): Promise<UserProfile> {
    const users = readJsonArrayFile<UserProfile>(dbPath);
    const idx = users.findIndex((u) => u.uid === profile.uid);
    if (idx >= 0) users[idx] = profile;
    else users.push(profile);
    writeJsonArrayFile(dbPath, users);
    return profile;
  }
}

