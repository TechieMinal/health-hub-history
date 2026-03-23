const mongoose = require("mongoose");

const apptSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctor: { type: String, required: true },
  specialty: { type: String },
  hospital: { type: String },
  date: { type: String, required: true },
  time: { type: String },
  type: { type: String, enum: ["Consultation", "Follow-up", "Emergency", "Routine", "Other"], default: "Consultation" },
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled", "No-Show"], default: "Scheduled" },
  notes: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

apptSchema.index({ user_id: 1, date: -1 });

module.exports = mongoose.model("Appointment", apptSchema);
