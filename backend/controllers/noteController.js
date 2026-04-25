const Note = require("../models/Note");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const SavedNote = require("../models/SavedNote");

const uploadNote = async (req, res) => {
  try {
    const { title, subject, topic } = req.body;

    if (!title || !subject || !topic) {
      return res.status(400).json({ message: "Title, subject, and topic are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Note file is required" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const note = await Note.create({
      title,
      subject,
      topic,
      fileUrl,
      uploadedBy: req.user._id,
    });

    return res.status(201).json({ message: "Note uploaded successfully", note });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload note", error: error.message });
  }
};

const getNotes = async (req, res) => {
  try {
    const { subject, topic, search } = req.query;
    const query = {};

    if (subject) {
      query.subject = new RegExp(subject, "i");
    }

    if (topic) {
      query.topic = new RegExp(topic, "i");
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
        { topic: new RegExp(search, "i") },
      ];
    }

    const notes = await Note.find(query)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    const noteIds = notes.map((note) => note._id);

    const [likes, comments] = await Promise.all([
      Like.aggregate([
        { $match: { noteId: { $in: noteIds } } },
        { $group: { _id: "$noteId", count: { $sum: 1 } } },
      ]),
      Comment.aggregate([
        { $match: { noteId: { $in: noteIds } } },
        { $group: { _id: "$noteId", count: { $sum: 1 } } },
      ]),
    ]);

    const likesMap = new Map(likes.map((entry) => [String(entry._id), entry.count]));
    const commentsMap = new Map(comments.map((entry) => [String(entry._id), entry.count]));

    const response = notes.map((note) => ({
      ...note.toObject(),
      likesCount: likesMap.get(String(note._id)) || 0,
      commentsCount: commentsMap.get(String(note._id)) || 0,
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notes", error: error.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate("uploadedBy", "name email");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const [likesCount, commentsCount, savedCount] = await Promise.all([
      Like.countDocuments({ noteId: note._id }),
      Comment.countDocuments({ noteId: note._id }),
      SavedNote.countDocuments({ noteId: note._id }),
    ]);

    return res.status(200).json({
      ...note.toObject(),
      likesCount,
      commentsCount,
      savedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch note details", error: error.message });
  }
};

const likeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const existingLike = await Like.findOne({ noteId: note._id, userId: req.user._id });
    if (existingLike) {
      return res.status(200).json({ message: "Note already liked" });
    }

    await Like.create({ noteId: note._id, userId: req.user._id });
    return res.status(201).json({ message: "Note liked" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to like note", error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { commentText } = req.body;

    if (!commentText) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const comment = await Comment.create({
      noteId: note._id,
      userId: req.user._id,
      commentText,
    });

    const populated = await comment.populate("userId", "name email");
    return res.status(201).json({ message: "Comment added", comment: populated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ noteId: req.params.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch comments", error: error.message });
  }
};

const saveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const existing = await SavedNote.findOne({ noteId: note._id, userId: req.user._id });
    if (existing) {
      return res.status(200).json({ message: "Note already saved" });
    }

    await SavedNote.create({ noteId: note._id, userId: req.user._id });
    return res.status(201).json({ message: "Note saved" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save note", error: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await Promise.all([
      Note.deleteOne({ _id: note._id }),
      Like.deleteMany({ noteId: note._id }),
      Comment.deleteMany({ noteId: note._id }),
      SavedNote.deleteMany({ noteId: note._id }),
    ]);

    return res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete note", error: error.message });
  }
};

module.exports = {
  uploadNote,
  getNotes,
  getNoteById,
  likeNote,
  addComment,
  getComments,
  saveNote,
  deleteNote,
};
