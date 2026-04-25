const User = require("../models/User");
const Note = require("../models/Note");
const SavedNote = require("../models/SavedNote");

const getMe = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

const getMyUploads = async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user._id })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch uploads", error: error.message });
  }
};

const getMySavedNotes = async (req, res) => {
  try {
    const saved = await SavedNote.find({ userId: req.user._id })
      .populate({
        path: "noteId",
        populate: { path: "uploadedBy", select: "name email" },
      })
      .sort({ createdAt: -1 });

    const notes = saved.map((entry) => entry.noteId).filter(Boolean);
    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch saved notes", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

module.exports = {
  getMe,
  getMyUploads,
  getMySavedNotes,
  getAllUsers,
};
