const router = require("express").Router();
const {
  getShares,
  addShare,
  revokeShare,
  findDoctor,
  getDoctorSharedRecords,
} = require("../controllers/shareController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.use(authenticate);

// Patient routes
router.get("/",              getShares);
router.post("/",             addShare);
router.patch("/:id/revoke",  revokeShare);
router.get("/find-doctor/:doctorId", findDoctor);

// Doctor route — get records shared with this doctor
router.get("/doctor-records", requireRole("doctor"), getDoctorSharedRecords);

module.exports = router;
