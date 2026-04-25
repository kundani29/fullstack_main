import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { addComment, fetchComments, fetchNoteById, likeNote, saveNote } from "../services/api";

function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [noteData, commentsData] = await Promise.all([fetchNoteById(id), fetchComments(id)]);
      setNote(noteData);
      setComments(commentsData);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await likeNote(id);
      setMessage(response.message);
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to like note");
    }
  };

  const handleSave = async () => {
    try {
      const response = await saveNote(id);
      setMessage(response.message);
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save note");
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await addComment(id, commentText);
      setMessage(response.message);
      setCommentText("");
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to comment");
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
              <strong>Uploader:</strong> {note.uploadedBy?.name || note.uploadedBy?.email}
            </p>
            <p>
              <strong>Likes:</strong> {note.likesCount} | <strong>Comments:</strong> {note.commentsCount} |{" "}
              <strong>Saved:</strong> {note.savedCount}
            </p>
            <div className="detail-actions">
              <button type="button" onClick={handleLike}>
                Like
              </button>
              <button type="button" onClick={handleSave}>
                Save
              </button>
              <a href={note.fileUrl} target="_blank" rel="noreferrer" className="link-btn">
                Open File
              </a>
            </div>
          </section>
        )}

        <section className="card">
          <h3>Comments</h3>
          <form onSubmit={handleComment} className="form">
            <textarea
              rows="3"
              placeholder="Write your comment..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <button type="submit">Post Comment</button>
          </form>
          <ul className="simple-list">
            {comments.map((comment) => (
              <li key={comment._id}>
                <strong>{comment.userId?.name || comment.userId?.email}:</strong> {comment.commentText}
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
