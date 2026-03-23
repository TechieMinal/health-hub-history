const { StatusCodes } = require("http-status-codes");
const Record = require("../models/Record");
const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const { getFileUrl, deleteFile, formatFileSize } = require("../services/fileService");

exports.getRecords = async (req, res) => {
  const { category, search, page = 1, limit = 50 } = req.query;
  const query = { user_id: req.user._id };
  if (category && category !== "All") query.category = category;
  if (search) query.$text = { $search: search };

  const records = await Record.find(query)
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Record.countDocuments(query);

  // Attach presigned URLs
  const enriched = await Promise.all(records.map(async (r) => {
    const obj = r.toJSON();
    if (r.s3_key) obj.file_url = await getFileUrl(r.s3_key);
    return obj;
  }));

  res.json({ ok: true, records: enriched, total, page: parseInt(page) });
};

exports.addRecord = async (req, res) => {
  const data = { ...req.body, user_id: req.user._id };
  if (req.file) {
    data.s3_key = req.file.key || null;
    data.mime_type = req.file.mimetype;
    data.size = formatFileSize(req.file.size);
    data.file_url = req.file.location || null;
  }
  const record = await Record.create(data);
  // Update storage used (rough estimate)
  await User.findByIdAndUpdate(req.user._id, { $inc: { storage_used: 0.1 } });
  await AuditLog.create({ user_id: req.user._id, action: "record_upload", detail: `Uploaded: ${data.name}`, ip: req.ip });
  res.status(StatusCodes.CREATED).json({ ok: true, record });
};

exports.updateRecord = async (req, res) => {
  const record = await Record.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!record) return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: "Record not found" });
  res.json({ ok: true, record });
};

exports.deleteRecord = async (req, res) => {
  const record = await Record.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  if (!record) return res.status(StatusCodes.NOT_FOUND).json({ ok: false, error: "Record not found" });
  if (record.s3_key) await deleteFile(record.s3_key);
  await AuditLog.create({ user_id: req.user._id, action: "record_delete", detail: `Deleted: ${record.name}`, ip: req.ip });
  res.json({ ok: true, message: "Record deleted" });
};

exports.getTimeline = async (req, res) => {
  const records = await Record.find({ user_id: req.user._id }).sort({ date: -1 });
  const iconMap = { Prescription: "💊", "Lab Report": "🧪", Radiology: "🩻", Discharge: "🏥", Vaccination: "💉", Bill: "🧾", Other: "📄" };
  const colorMap = { Prescription: "#00cfff", "Lab Report": "#00e59e", Radiology: "#9b6dff", Discharge: "#ffb347", Vaccination: "#00e59e", Bill: "#ff5b6e", Other: "#6a8faf" };
  const timeline = records.map((r) => ({
    date: r.date, icon: iconMap[r.category] || "📄", title: r.name,
    hospital: r.hospital, doctor: r.doctor, type: r.category,
    diagnosis: r.diagnosis, color: colorMap[r.category] || "#6a8faf",
  }));
  res.json({ ok: true, timeline });
};

exports.getSharedRecords = async (req, res) => {
  const Share = require("../models/Share");
  const doctorId = req.user.doctor_id;
  const activeShares = await Share.find({ doctor_id: doctorId, status: "Active" }).populate("user_id", "-password");
  const results = await Promise.all(activeShares.map(async (share) => {
    const records = await Record.find({ user_id: share.user_id._id });
    return { share, patient: share.user_id, records };
  }));
  res.json({ ok: true, sharedRecords: results });
};

exports.getUploadUrl = async (req, res) => {
  // Returns a pre-signed S3 URL for direct browser upload (optional feature)
  const { fileName, fileType } = req.query;
  try {
    const { getSignedUploadUrl } = require("../services/fileService");
    const { url, key } = await getSignedUploadUrl(fileName, fileType, req.user._id);
    res.json({ ok: true, url, key });
  } catch {
    res.status(501).json({ ok: false, error: "Direct upload not configured" });
  }
};
