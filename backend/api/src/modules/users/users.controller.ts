import type { Request, Response } from "express";
import { FileUsersRepository } from "./repositories/users.repository";
import { UsersService } from "./users.service";

const service = new UsersService(new FileUsersRepository());

export async function upsertProfile(req: Request, res: Response): Promise<void> {
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

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  const profile = await service.getMe(req.authUser.uid);
  res.json({ success: true, profile });
}

