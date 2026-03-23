/**
 * Razorpay Configuration
 *
 * Reads credentials in priority order:
 *   RAZORPAY_KEY    / RAZORPAY_SECRET     — canonical names in .env
 *   RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET — legacy aliases
 *
 * Returns null when credentials are missing or still set to placeholder
 * values — the payment service then runs in demo mode automatically.
 */
const logger = require("../utils/logger");

const keyId     = process.env.RAZORPAY_KEY     || process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_SECRET  || process.env.RAZORPAY_KEY_SECRET;

// Detect placeholder values — treat them the same as missing
const isPlaceholder = (v) => !v || v.includes("xxxx") || v.startsWith("your_");

let razorpay = null;

if (!isPlaceholder(keyId) && !isPlaceholder(keySecret)) {
  try {
    const Razorpay = require("razorpay");
    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    logger.info("✅  Razorpay configured");
  } catch (err) {
    logger.warn(`⚠️  Razorpay SDK error: ${err.message}`);
  }
} else {
  logger.info("ℹ️  Razorpay not configured — running in demo-payment mode");
}

module.exports = razorpay;
