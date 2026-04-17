import type { Request, Response } from "express";
import { PrismaUsersRepository } from "./repositories/users.repository";
import { UsersService } from "./users.service";

const service = new UsersService(new PrismaUsersRepository());

export async function upsertProfile(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const fullName = typeof req.body?.fullName === "string" ? req.body.fullName : undefined;
    const photoURL = typeof req.body?.photoURL === "string" ? req.body.photoURL : undefined;
    const profile = await service.createOrUpdateProfileFromToken(req.authUser, {
      fullName,
      photoURL,
    });
    res.json({ success: true, profile });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: (error as Error).message || "Profile service unavailable.",
    });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
    const profile = await service.getMe(req.authUser.uid);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: (error as Error).message || "Profile service unavailable.",
    });
  }
}

