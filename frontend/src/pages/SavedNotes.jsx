import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import NoteCard from "../components/NoteCard";
import { fetchMySavedNotes } from "../services/api";

function SavedNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSaved = async () => {
      try {
        setLoading(true);
        const data = await fetchMySavedNotes();
        setNotes(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load saved notes");
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, []);

  return (
    <div className="app-shell">
      <NavBar />
      <div className="content">
        <section className="card">
          <h2>Saved Notes</h2>
          {loading && <p>Loading saved notes...</p>}
          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="section">
          <div className="note-grid">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
          {!loading && !notes.length && <p>You have not saved any notes yet.</p>}
        </section>
      </div>
    </div>
  );
}

export default SavedNotes;
