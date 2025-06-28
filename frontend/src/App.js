import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import LoginRegister from "./LoginRegister";
import AllJournals from "./AllJournals";

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

    fetch(`https://journal-backend-web.onrender.com/entries?username=${username}`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error("error in finding entries..!"));
  }, [setEntries, username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = { title, content, username };
    fetch("https://journal-backend-web.onrender.com/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    })
      .then((res) => res.json())
      .then((data) => {
        setEntries((prev) => [data, ...prev]);
        setTitle("");
        setContent("");
      });
  };

  const handleDelete = (id) => {
    fetch(`https://journal-backend-web.onrender.com/entries/${id}`, { method: "DELETE" })
      .then(() => setEntries((prev) => prev.filter((e) => e._id !== id)));
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
    fetch(`https://journal-backend-web.onrender.com/entries/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setEntries((prev) =>
          prev.map((e) => (e._id === editId ? updated : e))
        );
        cancelEdit();
      });
  };

  return (
    <div style={{ backgroundColor: "#282a36", minHeight: "100vh", padding: "2rem", color: "#f8f8f2" }}>
      <div style={{ marginBottom: "1rem" }}>
        <p>
          Logged in as: <span style={{ color: "#50fa7b" }}>{username}</span>
        </p>
        <button onClick={handleLogout} style={{
          backgroundColor: "#ff5555",
          padding: "0.5rem",
          borderRadius: "4px",
          marginRight: "1rem",
          color: "#fff",
          border: "none",
          cursor: "pointer"
        }}>Logout</button>

        <button onClick={() => navigate("/all-journals")} style={{
          backgroundColor: "#8be9fd",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer"
        }}>View All Journals</button>
      </div>

      <h1 style={{ color: "#bd93f9", fontSize: "2.5rem" }}>My Journal</h1>

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
