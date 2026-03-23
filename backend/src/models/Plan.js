const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name:           { type: String, required: true, unique: true },
  price:          { type: Number, default: 0 },
  currency:       { type: String, default: "INR" },
  storage:        { type: Number },
  records:        { type: Number },
  shares:         { type: Number },
  description:    { type: String },
  features:       [String],
  active:         { type: Boolean, default: true },
  trialDays:      { type: Number, default: 0 },
  supportLevel:   String,
  apiAccess:      { type: Boolean, default: false },
  customBranding: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
});

module.exports = mongoose.model("Plan", planSchema);
