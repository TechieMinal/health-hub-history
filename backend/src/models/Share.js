const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor_id: { type: String, required: true },
  doctor_ref: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor_name: { type: String },
  specialty: { type: String },
  records: [{ type: String }],
  record_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Record" }],
  date: { type: String },
  status: { type: String, enum: ["Active", "Expired", "Revoked"], default: "Active" },
  expires: { type: String },
  expires_at: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

shareSchema.index({ user_id: 1 });
shareSchema.index({ doctor_id: 1, status: 1 });
shareSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Share", shareSchema);
