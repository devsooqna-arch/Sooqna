import { Router } from "express";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
});

