import type { NextFunction, Request, Response } from "express";
import type { ZodObject, ZodType } from "zod";
import { AppError } from "../shared/errors/appError";

type Schemas = {
  body?: ZodType;
  params?: ZodObject;
  query?: ZodObject;
};

function mapIssues(issues: Array<{ path: Array<string | number | symbol>; message: string }>): string {
  return issues
    .map((issue) => {
      const path = issue.path.map(String).join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success) {
          throw new AppError(
            400,
            `Invalid route params. ${mapIssues(parsed.error.issues)}`,
            "VALIDATION_ERROR",
            parsed.error.issues
          );
        }
        req.params = parsed.data as Request["params"];
      }

      if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success) {
          throw new AppError(
            400,
            `Invalid query params. ${mapIssues(parsed.error.issues)}`,
            "VALIDATION_ERROR",
            parsed.error.issues
          );
        }
        req.query = parsed.data as Request["query"];
      }

      if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body ?? {});
        if (!parsed.success) {
          throw new AppError(
            400,
            `Invalid request body. ${mapIssues(parsed.error.issues)}`,
            "VALIDATION_ERROR",
            parsed.error.issues
          );
        }
        req.body = parsed.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
