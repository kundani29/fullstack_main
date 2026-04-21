import React, { useState, useEffect, useRef } from "react";
import API_BASE_URL from "./config";

function Dashboard() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");

  const [likes, setLikes] = useState({});
  const [saved, setSaved] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");

  // 🔹 Fetch files
  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/files`);
      const data = await res.json();
      setFiles(data.files || data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // 🔹 Upload
  const handleUpload = async () => {
    const selectedFile = file || fileInputRef.current?.files?.[0];
    if (!selectedFile) return alert("Select file first");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      alert("File uploaded");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchFiles();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  };

  // 🔹 Delete
  const handleDelete = async (filename) => {
    await fetch(`${API_BASE_URL}/delete/${filename}`, {
      method: "DELETE",
    });

    fetchFiles();
  };

  // 🔹 Logout
  const handleLogout = () => {
    window.location.reload();
  };

  // ❤️ Like
  const handleLike = (f) => {
    setLikes({ ...likes, [f]: !likes[f] });
  };

  // ⭐ Save
  const handleSave = (f) => {
    setSaved({ ...saved, [f]: !saved[f] });
  };

  // 💬 Comment
  const handleComment = (f) => {
    if (!newComment) return;

    setComments({
      ...comments,
      [f]: [...(comments[f] || []), newComment],
    });

    setNewComment("");
  };

  return (
    <div>

      {/* 🔥 NAVBAR */}
      <div className="navbar">
        <h2>📚 Notes App</h2>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* MAIN */}
      <div className="dashboard">

        <h1>Welcome 👋</h1>

        {/* Upload */}
        <div className="file-box">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          <button onClick={handleUpload}>📤 Upload Note</button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Files */}
        <div className="file-list">
          {Array.isArray(files) &&
            files
              .filter((f) =>
                f.toLowerCase().includes(search.toLowerCase())
              )
              .map((f, index) => (
                <div className="file-card" key={index}>

                  {/* File name */}
                  <span className="file-name">{f}</span>

                  {/* Actions */}
                  <div>
                    <a
                      href={`${API_BASE_URL}/uploads/${f}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <button className="open-btn">📂 View</button>
                    </a>

                    <button onClick={() => handleLike(f)}>
                      {likes[f] ? "❤️" : "🤍"}
                    </button>

                    <button onClick={() => handleSave(f)}>
                      {saved[f] ? "⭐" : "☆"}
                    </button>

                    <button onClick={() => handleDelete(f)}>
                      🗑 Remove
                    </button>
                  </div>

                  {/* Comments */}
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="text"
                      placeholder="Add comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />

                    <button onClick={() => handleComment(f)}>
                      ➕ Add Comment
                    </button>

                    {(comments[f] || []).map((c, i) => (
                      <p key={i}>💬 {c}</p>
                    ))}
                  </div>

                </div>
              ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;