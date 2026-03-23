/**
 * MongoDB Connection
 *
 * Reads the connection URI in priority order:
 *   1. MONGO_URI      — canonical name specified in .env
 *   2. MONGODB_URI    — legacy / Atlas-style name (kept for compatibility)
 *
 * Both names are accepted so that either .env convention works
 * without changing the source code.
 */
const mongoose = require("mongoose");
const logger   = require("../utils/logger");

const connectDB = async () => {
  // Accept either naming convention
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    logger.error("❌  No database URI found. Set MONGO_URI in backend/.env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    logger.info(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`❌  MongoDB connection error: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => logger.warn("⚠️  MongoDB disconnected"));
  mongoose.connection.on("error", (err)  => logger.error(`MongoDB error: ${err.message}`));
};

module.exports = connectDB;
