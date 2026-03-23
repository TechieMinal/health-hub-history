/**
 * Logger — uses winston. Falls back to console if winston-daily-rotate-file is unavailable.
 */
const winston = require("winston");
const path = require("path");
const fs = require("fs");

const logDir = path.join(process.cwd(), "logs");
try { if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true }); } catch {}

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
);

const transports = [new winston.transports.Console({ format: consoleFormat })];

// Add file logging if daily-rotate is available
try {
  const DailyRotateFile = require("winston-daily-rotate-file");
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "14d",
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "7d",
    })
  );
} catch {
  // winston-daily-rotate-file not installed — file logging disabled
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { service: "healthhub-api" },
  transports,
});

module.exports = logger;
