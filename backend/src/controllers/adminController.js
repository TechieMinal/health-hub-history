const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Plan = require("../models/Plan");
const Upgrade = require("../models/Upgrade");
const AuditLog = require("../models/AuditLog");
const { sendEmail, templates } = require("../services/emailService");

exports.getUsers = async (req, res) => {
  const { role, status, search, page = 1, limit = 50 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  const users = await User.find(query).sort({ created_at: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
  const total = await User.countDocuments(query);
  res.json({ ok: true, users, total });
};

exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: "User not found" });
  await AuditLog.create({ user_id: req.user._id, action: "user_updated", detail: `Updated user ${user.email}`, ip: req.ip });
  res.json({ ok: true, user });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: "User not found" });
  await AuditLog.create({ user_id: req.user._id, action: "user_deleted", detail: `Deleted user ${user.email}`, ip: req.ip });
  res.json({ ok: true });
};

exports.verifyDoctor = async (req, res) => {
  const { action } = req.body; // "approve" or "reject"
  const newStatus = action === "approve" ? "verified" : "suspended";
  const user = await User.findByIdAndUpdate(req.params.id, { status: newStatus, verified: action === "approve" }, { new: true });
  if (!user) return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: "User not found" });
  if (action === "approve") {
    sendEmail({ to: user.email, ...templates.doctorApproved(user.name) }).catch(() => {});
  }
  await AuditLog.create({ user_id: req.user._id, action: "user_verified", detail: `Doctor ${user.name} ${action}d`, ip: req.ip });
  res.json({ ok: true, user });
};

exports.getPlans = async (req, res) => {
  const plans = await Plan.find();
  res.json({ ok: true, plans });
};

exports.updatePlan = async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: "Plan not found" });
  res.json({ ok: true, plan });
};

exports.getUpgrades = async (req, res) => {
  const upgrades = await Upgrade.find().sort({ createdAt: -1 });
  res.json({ ok: true, upgrades });
};

exports.processUpgrade = async (req, res) => {
  const { action } = req.body;
  const upgrade = await Upgrade.findByIdAndUpdate(
    req.params.id,
    { status: action === "approve" ? "Approved" : "Rejected" },
    { new: true }
  );
  if (!upgrade) return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: "Upgrade not found" });
  if (action === "approve") {
    await User.findByIdAndUpdate(upgrade.user_id, { plan: upgrade.to });
  }
  res.json({ ok: true, upgrade });
};

exports.getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find().sort({ ts: -1 }).limit(100).populate("user_id", "name email role");
  res.json({ ok: true, logs });
};

exports.suspendUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status || "suspended" },
    { new: true }
  );
  if (!user) return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: "User not found" });
  await AuditLog.create({ user_id: req.user._id, action: "user_suspended", detail: `User ${user.email} status changed`, ip: req.ip });
  res.json({ ok: true, user });
};

exports.getStats = async (req, res) => {
  const Record = require("../models/Record");
  const Payment = require("../models/Payment");
  const [totalUsers, totalDoctors, totalRecords, payments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "doctor" }),
    Record.countDocuments(),
    Payment.find({ status: "paid" }),
  ]);
  const mrr = payments.reduce((s, p) => s + (p.amount || 0), 0);
  res.json({ ok: true, totalUsers, totalDoctors, totalRecords, mrr });
};
