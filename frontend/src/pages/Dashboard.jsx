import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import NoteCard from "../components/NoteCard";
import { deleteNoteById, fetchMyProfile, fetchMySavedNotes, fetchMyUploads, fetchUsers } from "../services/api";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [me, myUploads, mySaved] = await Promise.all([
        fetchMyProfile(),
        fetchMyUploads(),
        fetchMySavedNotes(),
      ]);

      setProfile(me);
      setUploads(myUploads);
      setSavedNotes(mySaved);

      if (me.role === "admin") {
        const allUsers = await fetchUsers();
        setUsers(allUsers);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNoteById(noteId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete note");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app-shell">
      <NavBar />
      <div className="content">
        <div className="card">
          <h2>Dashboard</h2>
          {loading && <p>Loading dashboard...</p>}
          {error && <p className="error-text">{error}</p>}
          {profile && (
            <p>
              Welcome, {profile.name}! <strong>Role:</strong> {profile.role}
            </p>
          )}
        </div>

        <section className="section">
          <h3>My Uploaded Notes</h3>
          {!uploads.length && <p>No uploads yet.</p>}
          <div className="note-grid">
            {uploads.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                actionSlot={
                  profile?.role === "admin" ? (
                    <button type="button" onClick={() => handleDeleteNote(note._id)}>
                      Delete
                    </button>
                  ) : null
                }
              />
            ))}
          </div>
        </section>

        <section className="section">
          <h3>Saved Notes</h3>
          {!savedNotes.length && <p>No saved notes yet.</p>}
          <div className="note-grid">
            {savedNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        </section>

        {profile?.role === "admin" && (
          <section className="section">
            <h3>Admin: Users</h3>
            {!users.length && <p>No users found.</p>}
            <ul className="simple-list">
              {users.map((user) => (
                <li key={user._id}>
                  {user.name} - {user.email} ({user.role})
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
