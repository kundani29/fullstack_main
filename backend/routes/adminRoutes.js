const express = require("express");
const { getAllUsers } = require("../controllers/userController");
const { protect, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", protect, requireAdmin, getAllUsers);

module.exports = router;
