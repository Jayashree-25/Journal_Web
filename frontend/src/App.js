import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import LoginRegister from "./LoginRegister";
import AllJournals from "./AllJournals";
import API_URL from "./config";
import "./JournalHome.css";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };
}

// Home page when user is logged in
function JournalHome({ entries, setEntries, username, handleLogout }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;

    fetch(`${API_URL}/entries?username=${encodeURIComponent(username)}`, {
      headers: authHeaders(),
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          handleLogout();
          throw new Error("Session expired");
        }
        return res.json();
      })
      .then((data) => setEntries(data))
      .catch((err) => console.error("error in finding entries:", err));
  }, [setEntries, username, handleLogout]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = { title, content, username };
    fetch(`${API_URL}/entries`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(newEntry),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Add entry failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEntries((prev) => [data, ...prev]);
        setTitle("");
        setContent("");
      })
      .catch((err) => console.error("error in adding entry:", err));
  };

  const handleDelete = (id) => {
    fetch(`${API_URL}/entries/${id}`, { method: "DELETE", headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        setEntries((prev) => prev.filter((e) => e._id !== id));
      })
      .catch((err) => console.error("error in deleting entry:", err));
  };

  const startEditing = (entry) => {
    setEditId(entry._id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/entries/${editId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ title: editTitle, content: editContent }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Update failed: ${res.status}`);
        return res.json();
      })
      .then((updated) => {
        setEntries((prev) =>
          prev.map((e) => (e._id === editId ? updated : e))
        );
        cancelEdit();
      })
      .catch((err) => console.error("error in updating entry:", err));
  };

  return (
    <div className="journal-home">
      <div className="journal-home__container">
        <header className="journal-home__header">
          <div>
            <h1 className="journal-home__title">Journal</h1>
            <p className="journal-home__tagline">your thoughts, your story</p>
          </div>

          <div className="journal-home__actions">
            <span className="journal-home__user">
              Logged in as: <strong>{username}</strong>
            </span>
            <button className="journal-home__nav-link" onClick={() => navigate("/all-journals")}>
              All entries →
            </button>
            <button className="journal-home__logout" onClick={handleLogout}>
              Logout →
            </button>
          </div>
        </header>

        <h2 style={{ color: "#2f2923", fontSize: "2.5rem" }}>My Journal</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry Title" required style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          backgroundColor: "#1e1e1e",
          color: "#f1f1f1",
          border: "1px solid #333"
        }} />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="4" placeholder="Write your thoughts..." required style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          backgroundColor: "#1e1e1e",
          color: "#f1f1f1",
          border: "1px solid #333"
        }} />
        <button type="submit" style={{
          backgroundColor: "#ff79c6",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
          color: "#282a36",
          fontWeight: "bold"
        }}>Add Entry</button>
      </form>

      <ul>
        {entries.map((entry) => (
          <li key={entry._id} style={{ marginBottom: "1.5rem" }}>
            {editId === entry._id ? (
              <form onSubmit={handleUpdate}>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginBottom: "0.5rem"
                }} />
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} required style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginBottom: "0.5rem"
                }} />
                <button type="submit" style={{
                  marginRight: "0.5rem",
                  backgroundColor: "#8be9fd",
                  color: "#000",
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}>Save</button>
                <button type="button" onClick={cancelEdit} style={{
                  backgroundColor: "#6272a4",
                  color: "#fff",
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}>Cancel</button>
              </form>
            ) : (
              <>
                <h3>{entry.title}</h3>
                <p>{entry.content}</p>
                <small>{new Date(entry.date).toLocaleString()}</small><br />
                <button onClick={() => startEditing(entry)} style={{
                  marginTop: "0.5rem",
                  marginRight: "0.5rem",
                  backgroundColor: "#50fa7b",
                  color: "#000",
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}>Edit</button>
                <button onClick={() => handleDelete(entry._id)} style={{
                  marginTop: "0.5rem",
                  backgroundColor: "#ff5555",
                  color: "#000",
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

function App() {
  const [entries, setEntries] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  const handleLogin = (name) => setUsername(name);
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setUsername("");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !username ? (
              <LoginRegister onLogin={handleLogin} />
            ) : (
              <JournalHome entries={entries} setEntries={setEntries} username={username} handleLogout={handleLogout} />
            )
          }
        />
        <Route path="/all-journals" element={<AllJournals username={username} />} />
      </Routes>
    </Router>
  );
}

export default App;
