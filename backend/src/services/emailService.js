/**
 * Email Service — uses nodemailer when SMTP is configured, otherwise logs to console.
 */
const logger = require("../utils/logger");

let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_PASS) {
    logger.info("ℹ️  Email not configured — emails will be logged to console");
    return null;
  }
  try {
    const nodemailer = require("nodemailer");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return transporter;
  } catch { return null; }
};

const sendEmail = async ({ to, subject, html, text }) => {
  const t = initTransporter();
  if (!t) {
    logger.info(`📧  [DEMO EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  await t.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "Health Hub History"}" <${process.env.EMAIL_FROM || "noreply@healthhub.com"}>`,
    to, subject, html, text,
  });
};

const templates = {
  verifyEmail: (name, url) => ({
    subject: "Verify your Health Hub History email",
    html: `<h2>Welcome, ${name}!</h2><p><a href="${url}">Click here to verify your email</a></p>`,
  }),
  passwordReset: (name, url) => ({
    subject: "Reset your Health Hub History password",
    html: `<h2>Hi ${name},</h2><p><a href="${url}">Click here to reset your password</a></p>`,
  }),
  doctorApproved: (name) => ({
    subject: "Your doctor account has been approved",
    html: `<h2>Congratulations, Dr. ${name}!</h2><p>Your account has been verified. You can now access the platform.</p>`,
  }),
  paymentReceipt: (name, amount, plan, invoice) => ({
    subject: `Payment Receipt — ${invoice}`,
    html: `<h2>Payment Confirmed</h2><p>Hi ${name}, your payment of ₹${amount} for the ${plan} plan has been confirmed.</p><p>Invoice: ${invoice}</p>`,
  }),
};

module.exports = { sendEmail, templates };
