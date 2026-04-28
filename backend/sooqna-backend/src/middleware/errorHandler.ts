import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { isAppError } from "../shared/errors/appError";
import { sendError } from "../shared/contracts/api";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isAppError(err)) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    sendError(res, 400, "DATABASE_ERROR", "Database operation failed.");
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 400, "DATABASE_VALIDATION_ERROR", "Invalid database payload.");
    return;
  }

  sendError(res, 500, "INTERNAL_SERVER_ERROR", "Internal server error.");
}

