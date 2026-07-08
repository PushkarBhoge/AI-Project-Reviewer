import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

// ─── Route Imports ────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import sseRoutes from "./routes/sse.routes.js";

const app = express();

// ─── Global Middleware ────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging via Morgan → piped into Winston
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ─── API Routes ───────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/sse", sseRoutes);

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// ─── Error Handling ───────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
