const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patient_name: { type: String, required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  diag: { type: String, required: true },
  meds: [{
    name: { type: String, required: true },
    dose: String,
    freq: String,
    duration: String,
    notes: String,
  }],
  date: { type: String },
  notes: { type: String },
  status: { type: String, enum: ["Draft", "Sent", "Viewed", "Archived"], default: "Sent" },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

prescriptionSchema.index({ doctor_id: 1, createdAt: -1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
