const mongoose = require("mongoose");

const medSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  dose: { type: String },
  freq: { type: String },
  time: { type: String },
  for_condition: { type: String },
  stock: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

module.exports = mongoose.model("Medication", medSchema);
