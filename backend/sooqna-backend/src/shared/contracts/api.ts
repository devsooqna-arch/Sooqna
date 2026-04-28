import type { Response } from "express";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  code: string;
  message: string;
  details?: unknown;
};

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data } satisfies ApiSuccess<T>);
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
): void {
  res.status(status).json({ success: false, code, message, details } satisfies ApiError);
}
