const router = require("express").Router();
const { getProfile, updateProfile, changePassword } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate); // All user routes require authentication

router.get("/me",               getProfile);
router.put("/me",               updateProfile);
router.put("/me/password",      changePassword);

module.exports = router;
