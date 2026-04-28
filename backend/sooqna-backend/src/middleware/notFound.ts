import type { Request, Response } from "express";
import { sendError } from "../shared/contracts/api";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`);
}

