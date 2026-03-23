const mongoose = require("mongoose");

const upgradeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user: String,
  email: String,
  from: String,
  to: String,
  date: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

module.exports = mongoose.model("Upgrade", upgradeSchema);
