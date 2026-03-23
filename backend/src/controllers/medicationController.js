const Medication = require("../models/Medication");

exports.getMeds = async (req, res) => {
  const meds = await Medication.find({ user_id: req.user._id });
  res.json({ ok: true, meds });
};

exports.addMed = async (req, res) => {
  const med = await Medication.create({ ...req.body, user_id: req.user._id, active: true });
  res.status(201).json({ ok: true, med });
};

exports.updateMed = async (req, res) => {
  const med = await Medication.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body,
    { new: true }
  );
  if (!med) return res.status(404).json({ ok: false, error: "Medication not found" });
  res.json({ ok: true, med });
};

exports.deleteMed = async (req, res) => {
  await Medication.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  res.json({ ok: true });
};
