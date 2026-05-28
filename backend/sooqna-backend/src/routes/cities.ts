import { Router } from "express";
import { prisma } from "../config/prisma";

function toBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value !== "string") return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return defaultValue;
}

export const citiesRouter = Router();

citiesRouter.get("/", async (req, res) => {
  const activeOnly = toBoolean(req.query.activeOnly, true);
  const cities = await prisma.city.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
  });

  res.json({
    success: true,
    data: cities.map((city) => ({
      ...city,
      createdAt: city.createdAt?.toISOString() ?? null,
      updatedAt: city.updatedAt?.toISOString() ?? null,
    })),
  });
});
