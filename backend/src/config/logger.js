import winston from "winston";
import { env } from "./env.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: "ai-project-reviewer" },
  transports: [
    // Console — always
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),

    // File — errors only
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File — combined
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});
