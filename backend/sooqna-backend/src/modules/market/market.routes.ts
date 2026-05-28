import { Router } from "express";
import { prisma } from "../../config/prisma";

export const marketRouter = Router();

marketRouter.get("/insights", async (_req, res) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const publishedWhere = { deletedAt: null, status: "published" };

  const [topCities, topCategories, averagePricesByCategory, newListings7d] = await Promise.all([
    prisma.listing.groupBy({
      by: ["locationCity"],
      where: publishedWhere,
      _count: { _all: true },
      orderBy: { _count: { locationCity: "desc" } },
      take: 10,
    }),
    prisma.listing.groupBy({
      by: ["categoryId"],
      where: publishedWhere,
      _count: { _all: true },
      orderBy: { _count: { categoryId: "desc" } },
      take: 10,
    }),
    prisma.listing.groupBy({
      by: ["categoryId"],
      where: publishedWhere,
      _avg: { price: true },
      _count: { _all: true },
      orderBy: { _count: { categoryId: "desc" } },
      take: 10,
    }),
    prisma.listing.count({
      where: {
        ...publishedWhere,
        createdAt: { gte: sevenDaysAgo, lte: today },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      topCities: topCities.map((item) => ({
        city: item.locationCity,
        listingCount: item._count._all,
      })),
      topCategories: topCategories.map((item) => ({
        categoryId: item.categoryId,
        listingCount: item._count._all,
      })),
      averagePricesByCategory: averagePricesByCategory.map((item) => ({
        categoryId: item.categoryId,
        averagePrice: Math.round(item._avg.price ?? 0),
      })),
      newListings7d,
    },
  });
});
