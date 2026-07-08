import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";

const startServer = async () => {
  try {
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
