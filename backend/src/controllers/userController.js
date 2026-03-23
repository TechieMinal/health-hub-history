const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

exports.getProfile = async (req, res) => {
  res.json({ ok: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  const allowed = ["name", "phone", "blood", "allergies", "specialty", "hospital"];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ ok: true, user });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  const valid = await user.comparePassword(oldPassword);
  if (!valid) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: "Current password incorrect" });
  user.password = newPassword;
  await user.save();
  await AuditLog.create({ user_id: req.user._id, action: "password_change", detail: "Password changed", ip: req.ip });
  res.json({ ok: true, message: "Password updated" });
};
