const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const Payment = require("../models/Payment");
const Upgrade = require("../models/Upgrade");
const Plan = require("../models/Plan");
const { createOrder, confirmPayment, PLAN_PRICES } = require("../services/paymentService");
const { sendEmail, templates } = require("../services/emailService");
const AuditLog = require("../models/AuditLog");
const User = require("../models/User");

exports.getPlans = async (req, res) => {
  const plans = await Plan.find({ active: true });
  res.json({ ok: true, plans });
};

exports.createOrder = async (req, res) => {
  const { plan } = req.body;
  if (!plan) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: "Plan required" });
  const { order, payment } = await createOrder(req.user._id, plan);
  res.json({ ok: true, order, payment, razorpay_key_id: process.env.RAZORPAY_KEY_ID });
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const payment = await confirmPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!payment) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: "Payment verification failed" });
  
  const user = await User.findById(req.user._id);
  sendEmail({ to: user.email, ...templates.paymentReceipt(user.name, payment.amount, payment.plan, payment.invoice) }).catch(() => {});
  await AuditLog.create({ user_id: req.user._id, action: "payment", detail: `Payment ₹${payment.amount} for ${payment.plan}`, ip: req.ip });
  res.json({ ok: true, payment });
};

exports.webhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
  if (signature !== expected) return res.status(400).json({ error: "Invalid signature" });
  // Process webhook events
  const { event, payload } = req.body;
  if (event === "payment.captured") {
    const orderId = payload.payment.entity.order_id;
    await Payment.findOneAndUpdate({ razorpay_order_id: orderId }, { status: "paid" });
  }
  res.json({ ok: true });
};

exports.getPayments = async (req, res) => {
  const payments = await Payment.find({ user_id: req.user._id }).sort({ createdAt: -1 });
  res.json({ ok: true, payments });
};

exports.requestUpgrade = async (req, res) => {
  const { to } = req.body;
  const user = await User.findById(req.user._id);
  const upg = await Upgrade.create({
    user_id: req.user._id,
    user: user.name,
    email: user.email,
    from: user.plan,
    to,
    date: new Date().toISOString().split("T")[0],
    status: "Pending",
  });
  res.status(201).json({ ok: true, upgrade: upg });
};

exports.webhookHandler = exports.webhook;

exports.getAllPayments = async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).populate("user_id", "name email");
  const total = await Payment.countDocuments();
  res.json({ ok: true, payments, total });
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
  if (!upgrade) return res.status(404).json({ ok: false, error: "Upgrade not found" });
  if (action === "approve") {
    await User.findByIdAndUpdate(upgrade.user_id, { plan: upgrade.to });
  }
  res.json({ ok: true, upgrade });
};

exports.updatePlan = async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) return res.status(404).json({ ok: false, error: "Plan not found" });
  res.json({ ok: true, plan });
};
