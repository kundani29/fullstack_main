import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import axios from "axios";
import {
  addComment,
  fetchComments,
  fetchNoteById,
  likeNote,
  saveNote,
} from "../services/api";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🔄 Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [noteData, commentsData] = await Promise.all([
        fetchNoteById(id),
        fetchComments(id),
      ]);
      setNote(noteData);
      setComments(commentsData);
    } catch (error) {
      setMessage(
        error.response?.data?.message || error.message || "Failed to load note"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // ❤️ Like
  const handleLike = async () => {
    try {
      const res = await likeNote(id);
      setMessage(res.message);
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to like note");
    }
  };

  // 💾 Save
  const handleSave = async () => {
    try {
      const res = await saveNote(id);
      setMessage(res.message);
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save note");
    }
  };

  // 💬 Comment
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await addComment(id, commentText);
      setMessage(res.message);
      setCommentText("");
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to comment");
    }
  };

  // 🗑️ DELETE (NEW)
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      alert("Note deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="app-shell">
      <NavBar />

      <div className="content">
        {loading && <p>Loading note details...</p>}
        {message && <p className="message">{message}</p>}

        {note && (
          <section className="card">
            <h2>{note.title}</h2>

            <p>
              <strong>Subject:</strong> {note.subject}
            </p>

            <p>
              <strong>Topic:</strong> {note.topic}
            </p>

            <p>
              <strong>Uploader:</strong>{" "}
              {note.uploadedBy?.name || note.uploadedBy?.email}
            </p>

            <p>
              <strong>Likes:</strong> {note.likesCount} |{" "}
              <strong>Comments:</strong> {note.commentsCount} |{" "}
              <strong>Saved:</strong> {note.savedCount}
            </p>

            <div className="detail-actions">
              <button onClick={handleLike}>Like</button>
              <button onClick={handleSave}>Save</button>

              <a
                href={note.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="link-btn"
              >
                Open File
              </a>

              {/* ✅ DELETE BUTTON */}
              <button onClick={handleDelete}>Delete</button>
            </div>
          </section>
        )}

        {/* 💬 Comments */}
        <section className="card">
          <h3>Comments</h3>

          <form onSubmit={handleComment} className="form">
            <textarea
              rows="3"
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit">Post Comment</button>
          </form>

          <ul className="simple-list">
            {comments.map((c) => (
              <li key={c._id}>
                <strong>{c.userId?.name || c.userId?.email}:</strong>{" "}
                {c.commentText}
              </li>
            ))}
          </ul>

          {!comments.length && <p>No comments yet.</p>}
        </section>
      </div>
    </div>
  );
}

export default NoteDetail;