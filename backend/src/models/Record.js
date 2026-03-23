const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  category: { type: String, enum: ["Lab Report", "Prescription", "Radiology", "Discharge", "Vaccination", "Bill", "Other"], default: "Other" },
  hospital: { type: String, trim: true },
  doctor: { type: String, trim: true },
  date: { type: String },
  diagnosis: { type: String, trim: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  shared: { type: Boolean, default: false },
  size: { type: String },
  file_url: { type: String },
  s3_key: { type: String },
  mime_type: { type: String },
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

recordSchema.index({ user_id: 1, created_at: -1 });
recordSchema.index({ user_id: 1, category: 1 });
recordSchema.index({ user_id: 1, tags: 1 });
recordSchema.index({ name: "text", diagnosis: "text", tags: "text" });

module.exports = mongoose.model("Record", recordSchema);
