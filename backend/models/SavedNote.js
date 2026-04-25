const mongoose = require("mongoose");

const savedNoteSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

savedNoteSchema.index({ noteId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("SavedNote", savedNoteSchema);
