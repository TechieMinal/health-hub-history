const router = require("express").Router();
const { getAppts, addAppt, updateAppt, cancelAppt } = require("../controllers/appointmentController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/",             getAppts);
router.post("/",            addAppt);
router.put("/:id",          updateAppt);
router.patch("/:id/cancel", cancelAppt);

module.exports = router;
