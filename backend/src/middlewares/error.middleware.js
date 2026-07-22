import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

/**
 * 404 — Route not found
 */
export const notFound = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Not found — ${req.originalUrl}`,
  });
};

/**
 * Global error handler
 */
export const errorHandler = (err, _req, res, _next) => {
  const errorMessage = err?.message || err?.error?.description || err?.stack || (typeof err === "object" ? JSON.stringify(err) : String(err));
  logger.error(errorMessage);

  const statusCode = err?.statusCode || 500;
  const message =
    env.NODE_ENV === "production" ? "Internal server error" : (err?.message || err?.error?.description || "An unexpected error occurred");

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === "development" && { stack: err?.stack }),
  });
};
