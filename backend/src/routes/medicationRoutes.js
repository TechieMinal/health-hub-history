const router = require("express").Router();
const { getMeds, addMed, updateMed, deleteMed } = require("../controllers/medicationController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/",       getMeds);
router.post("/",      addMed);
router.put("/:id",    updateMed);
router.delete("/:id", deleteMed);

module.exports = router;
