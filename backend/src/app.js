require("dotenv").config();
require("express-async-errors");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const chatbotRoutes = require("./routes/chatbot.routes");

const { generalLimiter } = require("./middleware/rateLimiter");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const vitalRoutes = require("./routes/vitalRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const shareRoutes = require("./routes/shareRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ── Security Middleware ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CLIENT_URL || "http://localhost:3000").split(",");
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error("CORS not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
}));

// ── Body Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Sanitization ────────────────────────────────────────────────
app.use(mongoSanitize());
app.use(xss());

// ── Compression & Logging ───────────────────────────────────────
app.use(compression());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.path === "/health",
  }));
}

// ── Rate Limiting ───────────────────────────────────────────────
app.use("/api", generalLimiter);

// ── Health Check ─────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "healthhub-api", version: "1.0.0", timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/vitals", vitalRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/chatbot", chatbotRoutes);
// ── Swagger Docs ─────────────────────────────────────────────────
try {
  const swaggerDoc = YAML.load(path.join(__dirname, "docs/swagger.yaml"));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
    customSiteTitle: "Health Hub History API",
    customCss: ".swagger-ui .topbar { background-color: #0c1828; }",
  }));
} catch (e) {
  logger.warn("Swagger docs not loaded:", e.message);
}

// ── Error Handling ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
