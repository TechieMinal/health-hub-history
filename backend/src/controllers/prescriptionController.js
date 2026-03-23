const Prescription = require("../models/Prescription");
const AuditLog = require("../models/AuditLog");

exports.getPrescriptions = async (req, res) => {
  const prescriptions = await Prescription.find({ doctor_id: req.user._id }).sort({ createdAt: -1 });
  res.json({ ok: true, prescriptions });
};

exports.addPrescription = async (req, res) => {
  const rx = await Prescription.create({
    ...req.body,
    doctor_id: req.user._id,
    date: new Date().toISOString().split("T")[0],
    status: "Sent",
  });
  await AuditLog.create({ user_id: req.user._id, action: "prescription_created", detail: `Prescription for ${req.body.patient_name}`, ip: req.ip });
  res.status(201).json({ ok: true, prescription: rx });
};

exports.getDoctorPatients = async (req, res) => {
  const Share = require("../models/Share");
  const User = require("../models/User");
  const Record = require("../models/Record");
  const doctorId = req.user.doctor_id;
  const shares = await Share.find({ doctor_id: doctorId, status: "Active" });
  const patientIds = [...new Set(shares.map((s) => s.user_id.toString()))];
  const patients = await Promise.all(patientIds.map(async (pid) => {
    const patient = await User.findById(pid).select("-password");
    const recordCount = await Record.countDocuments({ user_id: pid });
    const sharedCount = shares.filter((s) => s.user_id.toString() === pid).reduce((sum, s) => sum + (s.records?.length || 0), 0);
    return patient ? { ...patient.toJSON(), recordCount, sharedCount } : null;
  }));
  res.json({ ok: true, patients: patients.filter(Boolean) });
};
