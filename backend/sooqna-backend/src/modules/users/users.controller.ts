import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { sendSuccess } from "../../shared/contracts/api";
import { PrismaUsersRepository } from "./repositories/users.repository";
import { UsersService } from "./users.service";

const service = new UsersService(new PrismaUsersRepository());

export async function upsertProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const fullName = typeof req.body?.fullName === "string" ? req.body.fullName : undefined;
    const photoURL = typeof req.body?.photoURL === "string" ? req.body.photoURL : undefined;
    const profile = await service.createOrUpdateProfileFromToken(req.authUser, {
      fullName,
      photoURL,
    });
    sendSuccess(res, { profile });
  } catch (err) {
    next(err);
  }
}

export async function patchProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const fullName = typeof req.body?.fullName === "string" ? req.body.fullName : undefined;
    const photoURL = typeof req.body?.photoURL === "string" ? req.body.photoURL : undefined;
    const profile = await service.patchProfileFromToken(req.authUser, {
      fullName,
      photoURL,
    });
    sendSuccess(res, { profile });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const profile = await service.getOrCreateMe(req.authUser);
    sendSuccess(res, { profile });
  } catch (err) {
    next(err);
  }
}

