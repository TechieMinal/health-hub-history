const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String },
  type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
  read: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

module.exports = mongoose.model("Notification", notificationSchema);
