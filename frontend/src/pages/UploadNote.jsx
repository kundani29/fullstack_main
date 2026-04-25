import { useState } from "react";
import NavBar from "../components/NavBar";
import { uploadNote } from "../services/api";

function UploadNote() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please choose a file to upload.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("topic", topic);
      formData.append("file", file);

      await uploadNote(formData);
      setMessage("Note uploaded successfully.");
      setTitle("");
      setSubject("");
      setTopic("");
      setFile(null);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <NavBar />
      <div className="content">
        <div className="card">
          <h2>Upload Note</h2>
          <form className="form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              required
            />
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default UploadNote;
