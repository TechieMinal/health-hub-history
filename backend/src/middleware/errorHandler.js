const { StatusCodes } = require("http-status-codes");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(StatusCodes.CONFLICT).json({ ok: false, error: `${field} already exists` });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: errors[0], errors });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Token expired", code: "TOKEN_EXPIRED" });
  }

  const status = err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(status).json({
    ok: false,
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: `Route ${req.method} ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
