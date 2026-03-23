/**
 * Auth Middleware
 *
 * Verifies JWT access tokens sent as:  Authorization: Bearer <token>
 *
 * JWT secret resolution order (matches authController):
 *   JWT_ACCESS_SECRET  — fine-grained override (optional)
 *   JWT_SECRET         — canonical key from .env (always set)
 */
const jwt           = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const User          = require("../models/User");
const { cache }     = require("../config/redis");

// Shared helper so both functions read the same secret
const accessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Reject blacklisted tokens (set on logout)
    const blacklisted = await cache.get(`bl:${token}`);
    if (blacklisted) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Token revoked" });
    }

    const decoded = jwt.verify(token, accessSecret());
    const user    = await User.findById(decoded.id).select("-password -refreshTokens");

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "User not found" });
    }
    if (user.status === "suspended") {
      return res.status(StatusCodes.FORBIDDEN).json({ ok: false, error: "Account suspended. Contact admin." });
    }

    req.user  = user;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Invalid token" });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token   = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, accessSecret());
      const user    = await User.findById(decoded.id).select("-password -refreshTokens");
      if (user) req.user = user;
    }
  } catch (_) {}
  next();
};

module.exports = { authenticate, optionalAuth };
