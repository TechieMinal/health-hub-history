const router = require("express").Router();
const { getVitals, addVital, deleteVital } = require("../controllers/vitalController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/",       getVitals);
router.post("/",      addVital);
router.delete("/:id", deleteVital);

module.exports = router;
