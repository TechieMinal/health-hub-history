require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");
const { connectRedis } = require("./config/redis");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await connectRedis();

  const server = app.listen(PORT, () => {
    logger.info(`🚀  Health Hub History API running on port ${PORT}`);
    logger.info(`📖  API Docs:    http://localhost:${PORT}/api/docs`);
    logger.info(`🏥  Health:      http://localhost:${PORT}/health`);
    logger.info(`🌍  Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`🔗  Frontend:    http://localhost:3000`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — graceful shutdown...`);
    server.close(async () => {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
      logger.info("Server closed");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Rejection:", err.message);
    shutdown("UNHANDLED_REJECTION");
  });
};

start();
