import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env, validateEnv } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";
import fs from "fs/promises";
import path from "path";

const startServer = async () => {
  try {
    validateEnv();

    // Clean up stale project-relative tmp/repos from prior runs
    const staleTmp = path.resolve("tmp/repos");
    try {
      await fs.rm(staleTmp, { recursive: true, force: true });
      logger.info(`Cleaned up stale temp directory: ${staleTmp}`);
    } catch (cleanupErr) {
      logger.warn(`Could not clean stale temp dir: ${cleanupErr.message}`);
    }

    await connectDB();

    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
