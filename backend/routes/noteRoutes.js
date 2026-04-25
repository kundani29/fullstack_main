const express = require("express");
const {
  uploadNote,
  getNotes,
  getNoteById,
  likeNote,
  addComment,
  getComments,
  saveNote,
  deleteNote,
} = require("../controllers/noteController");
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getNotes);
router.get("/:id", getNoteById);
router.post("/upload", protect, upload.single("file"), uploadNote);
router.post("/:id/like", protect, likeNote);
router.post("/:id/comment", protect, addComment);
router.get("/:id/comments", getComments);
router.post("/:id/save", protect, saveNote);
router.delete("/:id", protect, requireAdmin, deleteNote);

module.exports = router;
