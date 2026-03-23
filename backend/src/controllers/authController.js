const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { cache } = require("../config/redis");
const { sendEmail, templates } = require("../services/emailService");
const logger = require("../utils/logger");

const signTokens = (userId) => {
  // Accept JWT_SECRET (canonical) with fine-grained overrides as optional refinements
  const accessSecret  = process.env.JWT_ACCESS_SECRET  || process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secret not configured. Set JWT_SECRET in backend/.env");
  }

  const accessToken = jwt.sign({ id: userId }, accessSecret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
  const refreshToken = jwt.sign({ id: userId }, refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
  return { accessToken, refreshToken };
};

const logAction = async (userId, action, detail, ip) => {
  try {
    await AuditLog.create({ user_id: userId, action, detail, ip, ts: new Date() });
  } catch (_) {}
};

exports.register = async (req, res) => {
  const { name, email, password, role = "patient", phone, specialty, hospital, license, blood, allergies } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(StatusCodes.CONFLICT).json({ ok: false, error: "Email already registered" });

  const doctor_id = role === "doctor" ? `DOC${Math.floor(100 + Math.random() * 900)}` : undefined;
  const avatar = role === "doctor" ? "🩺" : "👤";
  const status = role === "doctor" ? "pending_verification" : "active";
  const verified = role !== "doctor";

  const emailVerifyToken = crypto.randomBytes(32).toString("hex");
  const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    name, email, password, role, phone, specialty, hospital, license, blood, allergies,
    avatar, plan: "Basic", storage_used: 0, status, doctor_id, verified,
    emailVerifyToken: crypto.createHash("sha256").update(emailVerifyToken).digest("hex"),
    emailVerifyExpires,
  });

  const { accessToken, refreshToken } = signTokens(user._id);
  await cache.set(`rt:${user._id}:${refreshToken}`, "1", 7 * 24 * 3600);

  // Send verification email (non-blocking)
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`;
  sendEmail({ to: email, ...templates.verifyEmail(name, verifyUrl) }).catch(() => {});

  await logAction(user._id, "register", `New ${role} registered`, req.ip);

  const safeUser = user.toJSON();
  res.status(StatusCodes.CREATED).json({ ok: true, accessToken, refreshToken, user: safeUser });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Invalid email or password" });

  if (user.isLocked()) {
    return res.status(StatusCodes.TOO_MANY_REQUESTS).json({ ok: false, error: "Account temporarily locked. Try again later." });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Invalid email or password" });
  }

  if (user.status === "suspended") {
    return res.status(StatusCodes.FORBIDDEN).json({ ok: false, error: "Account suspended. Contact admin." });
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();

  const { accessToken, refreshToken } = signTokens(user._id);
  await cache.set(`rt:${user._id}:${refreshToken}`, "1", 7 * 24 * 3600);

  await logAction(user._id, "login", `${user.role} login`, req.ip);

  const safeUser = user.toJSON();
  res.json({ ok: true, accessToken, refreshToken, user: safeUser });
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  // Blacklist the access token
  const decoded = jwt.decode(req.token);
  if (decoded?.exp) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await cache.set(`bl:${req.token}`, "1", ttl);
  }
  if (refreshToken) {
    await cache.del(`rt:${req.user._id}:${refreshToken}`);
  }
  await logAction(req.user._id, "logout", "User logged out", req.ip);
  res.json({ ok: true, message: "Logged out" });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const stored = await cache.get(`rt:${decoded.id}:${refreshToken}`);
    if (!stored) return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Invalid refresh token" });

    const user = await User.findById(decoded.id);
    if (!user || user.status === "suspended") {
      return res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "User not found or suspended" });
    }

    // Rotate refresh token
    await cache.del(`rt:${decoded.id}:${refreshToken}`);
    const { accessToken, refreshToken: newRefresh } = signTokens(user._id);
    await cache.set(`rt:${user._id}:${newRefresh}`, "1", 7 * 24 * 3600);

    res.json({ ok: true, accessToken, refreshToken: newRefresh });
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ ok: false, error: "Invalid or expired refresh token" });
  }
};

exports.getCurrentUser = async (req, res) => {
  res.json({ ok: true, user: req.user });
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ emailVerifyToken: hashed, emailVerifyExpires: { $gt: Date.now() } });
  if (!user) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: "Invalid or expired verification link" });
  user.verified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();
  res.json({ ok: true, message: "Email verified successfully" });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always return success to prevent email enumeration
  if (!user) return res.json({ ok: true, message: "If that email exists, a reset link has been sent" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  sendEmail({ to: email, ...templates.passwordReset(user.name, resetUrl) }).catch(() => {});

  res.json({ ok: true, message: "If that email exists, a reset link has been sent" });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: "Invalid or expired reset token" });
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  await logAction(user._id, "password_reset", "Password reset via email", req.ip);
  res.json({ ok: true, message: "Password reset successful" });
};
