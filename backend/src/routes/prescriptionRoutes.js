const router = require("express").Router();
const {
  getPrescriptions,
  addPrescription,
  getDoctorPatients,
} = require("../controllers/prescriptionController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.use(authenticate);
router.use(requireRole("doctor")); // All prescription routes are doctor-only

router.get("/",        getPrescriptions);
router.post("/",       addPrescription);
router.get("/patients", getDoctorPatients);

module.exports = router;
