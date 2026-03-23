const express = require("express");
const Plan = require("../models/Plan");

const router = express.Router();

// GET all pricing plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.find({ active: true }).sort({ price: 1 });

    res.json({
      ok: true,
      plans
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

module.exports = router;