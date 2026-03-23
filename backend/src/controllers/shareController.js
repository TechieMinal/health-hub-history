const Share = require("../models/Share");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

exports.getShares = async (req, res) => {
  const shares = await Share.find({ user_id: req.user._id });
  res.json({ ok: true, shares });
};

exports.addShare = async (req, res) => {
  const { doctor_id, records, record_ids } = req.body;
  const doctor = await User.findOne({ doctor_id, role: "doctor" });
  if (!doctor) return res.status(404).json({ ok: false, error: "Doctor not found" });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const share = await Share.create({
    user_id: req.user._id,
    doctor_id,
    doctor_ref: doctor._id,
    doctor_name: doctor.name,
    specialty: doctor.specialty,
    records: records || [],
    record_ids: record_ids || [],
    date: new Date().toISOString().split("T")[0],
    status: "Active",
    expires: expiresAt.toISOString().split("T")[0],
    expires_at: expiresAt,
  });

  await AuditLog.create({ user_id: req.user._id, action: "record_share", detail: `Shared ${records?.length || 0} records with ${doctor.name}`, ip: req.ip });
  res.status(201).json({ ok: true, share });
};

exports.revokeShare = async (req, res) => {
  const share = await Share.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    { status: "Revoked" },
    { new: true }
  );
  if (!share) return res.status(404).json({ ok: false, error: "Share not found" });
  await AuditLog.create({ user_id: req.user._id, action: "share_revoke", detail: `Revoked share ${req.params.id}`, ip: req.ip });
  res.json({ ok: true });
};

exports.findDoctor = async (req, res) => {
  const { doctorId } = req.params;
  const doctor = await User.findOne({ doctor_id: doctorId, role: "doctor" }).select("-password");
  if (!doctor) return res.status(404).json({ ok: false, error: "Doctor not found" });
  res.json({ ok: true, doctor: { id: doctor._id, doctor_id: doctor.doctor_id, name: doctor.name, specialty: doctor.specialty, hospital: doctor.hospital, verified: doctor.status === "verified" } });
};

exports.getDoctorSharedRecords = async (req, res) => {
  const doctorId = req.user.doctor_id;
  const shares = await Share.find({ doctor_id: doctorId, status: "Active" });
  const Record = require("../models/Record");

  const results = await Promise.all(shares.map(async (share) => {
    const patient = await User.findById(share.user_id).select("-password");
    const records = await Record.find({ _id: { $in: share.record_ids || [] } });
    return {
      share,
      patient: patient ? { name: patient.name, blood: patient.blood } : null,
      records,
    };
  }));

  res.json({ ok: true, records: results });
};
