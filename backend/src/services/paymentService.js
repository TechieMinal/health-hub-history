/**
 * Payment Service
 * Uses Razorpay when configured; falls back to demo mode otherwise.
 */
const crypto = require("crypto");
const Payment = require("../models/Payment");
const User = require("../models/User");
const logger = require("../utils/logger");

const PLAN_PRICES = {
  Free: 0,
  Basic: 99,
  Premium: 299,
  Hospital: 2999,
};

const createOrder = async (userId, planName) => {
  const amount = PLAN_PRICES[planName];
  if (amount === undefined) throw new Error("Invalid plan");

  const invoice = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = new Date().toISOString().split("T")[0];

  const razorpay = require("../config/razorpay");

  if (!razorpay || amount === 0) {
    // Demo / free plan — create a "demo" payment record
    const payment = await Payment.create({
      user_id: userId, amount, currency: "INR", plan: planName,
      status: amount === 0 ? "paid" : "demo_created",
      razorpay_order_id: `demo_order_${Date.now()}`,
      date, invoice,
    });
    if (amount === 0) await User.findByIdAndUpdate(userId, { plan: planName });
    return {
      order: { id: payment.razorpay_order_id, amount: amount * 100, currency: "INR" },
      payment,
      demo: true,
    };
  }

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `rcpt_${userId}_${Date.now()}`,
    notes: { userId: userId.toString(), plan: planName },
  });

  const payment = await Payment.create({
    user_id: userId, amount, currency: "INR", plan: planName,
    status: "created", razorpay_order_id: order.id, date, invoice,
  });

  return { order, payment };
};

const confirmPayment = async (orderId, paymentId, signature) => {
  const razorpay = require("../config/razorpay");

  if (!razorpay) {
    // Demo mode — just mark it paid
    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id: orderId },
      { status: "paid", razorpay_payment_id: paymentId },
      { new: true }
    );
    if (payment) await User.findByIdAndUpdate(payment.user_id, { plan: payment.plan });
    return payment;
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expected !== signature) {
    logger.warn("Razorpay signature mismatch");
    return null;
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpay_order_id: orderId },
    { status: "paid", razorpay_payment_id: paymentId },
    { new: true }
  );

  if (payment) await User.findByIdAndUpdate(payment.user_id, { plan: payment.plan });
  return payment;
};

module.exports = { createOrder, confirmPayment, PLAN_PRICES };
