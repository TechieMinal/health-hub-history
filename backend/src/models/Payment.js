const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  plan: { type: String },
  status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  invoice: String,
  date: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

paymentSchema.index({ user_id: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
