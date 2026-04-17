import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { isAppError } from "../shared/errors/appError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isAppError(err)) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      success: false,
      code: "DATABASE_ERROR",
      message: "Database operation failed.",
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      code: "DATABASE_VALIDATION_ERROR",
      message: "Invalid database payload.",
    });
    return;
  }

  res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error.",
  });
}

