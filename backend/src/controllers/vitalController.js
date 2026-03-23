const Vital = require("../models/Vital");

exports.getVitals = async (req, res) => {
  const vitals = await Vital.find({ user_id: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({ ok: true, vitals });
};

exports.addVital = async (req, res) => {
  const vital = await Vital.create({ ...req.body, user_id: req.user._id });
  res.status(201).json({ ok: true, vital });
};

exports.deleteVital = async (req, res) => {
  await Vital.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  res.json({ ok: true });
};
