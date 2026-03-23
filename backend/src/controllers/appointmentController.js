const Appointment = require("../models/Appointment");
const AuditLog = require("../models/AuditLog");

exports.getAppts = async (req, res) => {
  const appts = await Appointment.find({ user_id: req.user._id }).sort({ date: -1 });
  res.json({ ok: true, appts });
};

exports.addAppt = async (req, res) => {
  const appt = await Appointment.create({ ...req.body, user_id: req.user._id, status: "Scheduled" });
  res.status(201).json({ ok: true, appt });
};

exports.updateAppt = async (req, res) => {
  const appt = await Appointment.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body,
    { new: true }
  );
  if (!appt) return res.status(404).json({ ok: false, error: "Appointment not found" });
  res.json({ ok: true, appt });
};

exports.cancelAppt = async (req, res) => {
  const appt = await Appointment.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    { status: "Cancelled" },
    { new: true }
  );
  if (!appt) return res.status(404).json({ ok: false, error: "Appointment not found" });
  await AuditLog.create({ user_id: req.user._id, action: "appt_cancel", detail: `Cancelled appointment ${req.params.id}`, ip: req.ip });
  res.json({ ok: true, appt });
};
