import { Link } from "react-router-dom";

function NoteCard({ note, actionSlot }) {
  return (
    <article className="note-card">
      <h3>{note.title}</h3>
      <p>
        <strong>Subject:</strong> {note.subject}
      </p>
      <p>
        <strong>Topic:</strong> {note.topic}
      </p>
      <p>
        <strong>Uploader:</strong> {note.uploadedBy?.name || note.uploadedBy?.email || "Unknown"}
      </p>
      <div className="note-card-footer">
        <Link to={`/notes/${note._id}`} className="link-btn">
          View Details
        </Link>
        {actionSlot}
      </div>
    </article>
  );
}

export default NoteCard;
