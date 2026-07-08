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
  logger.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === "production" ? "Internal server error" : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
