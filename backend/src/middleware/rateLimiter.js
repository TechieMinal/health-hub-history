const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { ok: false, error: message || "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded: ${req.ip} -> ${req.path}`);
      res.status(429).json(options.message);
    },
  });

const generalLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  "Too many requests from this IP. Please try again later."
);

const authLimiter = createLimiter(
  15 * 60 * 1000,
  parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  "Too many auth attempts. Please try again in 15 minutes."
);

const uploadLimiter = createLimiter(60 * 1000, 10, "Upload limit exceeded. Max 10 uploads per minute.");

module.exports = { generalLimiter, authLimiter, uploadLimiter };
