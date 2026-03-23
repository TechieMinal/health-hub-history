const router = require("express").Router();
const {
  getPlans,
  createOrder,
  verifyPayment,
  getPayments,
  getPaymentHistory,
  requestUpgrade,
  webhookHandler,
} = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware");

// Public — anyone can view plans
router.get("/plans", getPlans);

// Razorpay webhook (raw body needed, handled separately in app.js if required)
router.post("/webhook", webhookHandler);

// Protected routes
router.use(authenticate);

router.get("/",              getPayments);        // current user's payment history
router.post("/create-order", createOrder);        // create a Razorpay order
router.post("/verify",       verifyPayment);      // verify & confirm payment
router.post("/upgrade",      requestUpgrade);     // request a plan upgrade

module.exports = router;
