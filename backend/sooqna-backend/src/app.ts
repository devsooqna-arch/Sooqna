import * as path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { openApiSpec } from "./config/swagger";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import swaggerUi from "swagger-ui-express";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// General API limiter — 500 req / 15 min
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Auth limiter — 20 req / 15 min per IP (brute-force protection)
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  })
);

// Abuse protection for write-heavy/sensitive routes
app.use(
  "/api/reports",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: "RATE_LIMITED", message: "Too many report requests." },
  })
);

app.use(
  "/api/messages",
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: "RATE_LIMITED", message: "Too many messaging requests." },
  })
);

app.use(
  "/api/favorites",
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: "RATE_LIMITED", message: "Too many favorites requests." },
  })
);

app.use(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many contact requests." },
  })
);

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

