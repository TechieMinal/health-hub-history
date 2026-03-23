const router = require("express").Router();
const {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

// Public routes
router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);
router.post("/refresh",  refreshToken);
router.get("/verify-email",  verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me",      authenticate, getCurrentUser);

module.exports = router;
