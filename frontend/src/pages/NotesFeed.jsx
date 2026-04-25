import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import NoteCard from "../components/NoteCard";
import { fetchNotes } from "../services/api";

function NotesFeed() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    topic: "",
  });

  const loadNotes = async (params = {}) => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchNotes(params);
      setNotes(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadNotes(filters);
  };

  return (
    <div className="app-shell">
      <NavBar />
      <div className="content">
        <section className="card">
          <h2>Notes Feed</h2>
          <form className="filter-row" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by title/subject/topic"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
            <input
              type="text"
              placeholder="Filter by subject"
              value={filters.subject}
              onChange={(event) => setFilters((prev) => ({ ...prev, subject: event.target.value }))}
            />
            <input
              type="text"
              placeholder="Filter by topic"
              value={filters.topic}
              onChange={(event) => setFilters((prev) => ({ ...prev, topic: event.target.value }))}
            />
            <button type="submit">Apply</button>
          </form>
          {loading && <p>Loading notes...</p>}
          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="section">
          <div className="note-grid">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
          {!loading && !notes.length && <p>No notes found.</p>}
        </section>
      </div>
    </div>
  );
}

export default NotesFeed;
