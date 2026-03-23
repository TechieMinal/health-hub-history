const router = require("express").Router();
const {
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  getUploadUrl,
} = require("../controllers/recordController");
const { authenticate } = require("../middleware/authMiddleware");
const { uploadMiddleware } = require("../middleware/uploadMiddleware");

router.use(authenticate); // All record routes require authentication

router.get("/",          getRecords);
router.post("/",         uploadMiddleware, addRecord);     // supports optional file upload
router.put("/:id",       updateRecord);
router.delete("/:id",    deleteRecord);
router.get("/upload-url", getUploadUrl);                   // pre-signed S3 URL (optional)

module.exports = router;
