const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  detail: { type: String },
  ip: { type: String },
  ts: { type: Date, default: Date.now },
}, {
  timestamps: false,
});

auditLogSchema.index({ ts: -1 });
auditLogSchema.index({ user_id: 1 });
auditLogSchema.index({ action: 1 });
// Auto-delete logs after 1 year
auditLogSchema.index({ ts: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
