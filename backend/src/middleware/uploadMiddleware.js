/**
 * Upload Middleware
 * Uses local disk/memory storage in development.
 * Falls back gracefully when AWS is not configured.
 */
const multer = require("multer");
const path = require("path");

const ALLOWED_MIMES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only PDF, JPEG, PNG, and WEBP files allowed"), false);
  }
};

// Use memory storage — for production swap this with multer-s3
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 1 },
});

// Single file upload handler — field name = "file"
const uploadMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ ok: false, error: "File too large. Maximum size is 20 MB." });
      }
      return res.status(400).json({ ok: false, error: err.message });
    }
    if (err) return next(err);
    next();
  });
};

module.exports = { upload, uploadMiddleware };
