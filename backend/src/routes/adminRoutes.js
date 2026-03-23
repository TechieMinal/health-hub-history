const router = require("express").Router();
const {
  getUsers,
  updateUser,
  deleteUser,
  verifyDoctor,
  suspendUser,
  getStats,
} = require("../controllers/adminController");
const { getAnalytics } = require("../controllers/analyticsController");
const {
  getPlans,
  getUpgrades,
  processUpgrade,
  updatePlan,
  getAllPayments,
} = require("../controllers/paymentController");
const AuditLog = require("../models/AuditLog");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.use(authenticate);
router.use(requireRole("admin")); // Every admin route requires admin role

// ── Users ────────────────────────────────────────────────────
router.get("/users",              getUsers);
router.patch("/users/:id",        updateUser);
router.delete("/users/:id",       deleteUser);
router.patch("/users/:id/verify", verifyDoctor);
router.patch("/users/:id/suspend", suspendUser);

// ── Analytics ────────────────────────────────────────────────
router.get("/analytics", getAnalytics);
router.get("/stats",     getStats);

// ── Plans ────────────────────────────────────────────────────
router.get("/plans",      getPlans);
router.put("/plans/:id",  updatePlan);

// ── Payments ─────────────────────────────────────────────────
router.get("/payments",   getAllPayments);

// ── Upgrades ─────────────────────────────────────────────────
router.get("/upgrades",          getUpgrades);
router.patch("/upgrades/:id",    processUpgrade);

// ── Audit Logs ───────────────────────────────────────────────
router.get("/audit-logs", async (req, res) => {
  const { page = 1, limit = 100 } = req.query;
  const logs = await AuditLog.find()
    .sort({ ts: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("user_id", "name email role");
  const total = await AuditLog.countDocuments();
  res.json({ ok: true, logs, total });
});

module.exports = router;
