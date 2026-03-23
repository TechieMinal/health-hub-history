const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Invalid email"] },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
  avatar: { type: String, default: "👤" },
  phone: { type: String, trim: true },
  blood: { type: String },
  allergies: { type: String },
  plan: { type: String, enum: ["Free", "Basic", "Premium", "Hospital", "Admin"], default: "Basic" },
  storage_used: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "suspended", "pending_verification", "verified"], default: "active" },
  // Doctor-specific
  specialty: String,
  hospital: String,
  license: String,
  doctor_id: { type: String, unique: true, sparse: true },
  // Auth
  verified: { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshTokens: [{ type: String }],
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.password; delete ret.refreshTokens; delete ret.__v; return ret; } },
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ doctor_id: 1 });

userSchema.virtual("joined").get(function () {
  return this.created_at?.toISOString().split("T")[0];
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model("User", userSchema);
