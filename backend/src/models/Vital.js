const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true },
  bp: { type: String },
  sugar: { type: String },
  hr: { type: String },
  wt: { type: String },
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

vitalSchema.index({ user_id: 1, date: -1 });

module.exports = mongoose.model("Vital", vitalSchema);
