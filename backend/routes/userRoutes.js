const express = require("express");
const { getMe, getMySavedNotes, getMyUploads } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/saved", protect, getMySavedNotes);
router.get("/uploads", protect, getMyUploads);

module.exports = router;
