import React, { useEffect, useState } from "react";
import {BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LoginRegister from "./LoginRegister";  // Login/Register component
import AllJournals from "./AllJournals";

function App() {
  const [entries, setEntries] = useState([]); //entries: variable to hold journal data, setEntries: update the variable
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [username, setUsername] = useState(localStorage.getItem("username") || "");  // Save user login

  const handleLogin = (name) => {
    setUsername(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername("");
  };

  //useEffect:  lets you run code when the component loads.. like if page loaded, do this..
  useEffect(() => {
    fetch("http://localhost:5000/entries")
      .then(res => res.json())  //converts the response to json
      .then(data => setEntries(data))  //saves the entries into our entries state
      .catch(err => console.error("error in finding entries..!"));
  }, []);  // Empty dependency array = run only once on page load

  //handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();  //prevent page reload

    const newEntry = { title, content };

    fetch("http://localhost:5000/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    })
      .then(res => res.json())
      .then(data => {
        console.log("Added entry:", data);
        setEntries(prevEntries => [data, ...prevEntries]);  //add new entry to top of list
        setTitle("");  //clear form after submit
        setContent("");
      })
      .catch(err => console.error("error in adding entries..!"));
  }

  //handle delete
  const handleDelete = (id) => {
    fetch(`http://localhost:5000/entries/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setEntries(prevEntries => prevEntries.filter(entry => entry._id !== id)); //remove entry
      })
      .catch(err => console.error("error in deleting entries..!"));
  }

  //when edit is clicked
  const startEditing = (entry) => {
    setEditId(entry._id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
  };

  //cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditContent("");
  };

  //update entry (PUT)
  const handleUpdate = (e) => {
    e.preventDefault();

    fetch(`http://localhost:5000/entries/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
      }),
    })
      .then((res) => res.json())
      .then((updatedEntry) => {
        console.log("server returned: ", updatedEntry)
        setEntries(prevEntries => prevEntries.map(entry => (entry._id === editId ? updatedEntry : entry))
        );
        cancelEdit();
      })
      .catch((err) => console.error("cancelling error"));
  }

  return (
    <div style={{
      backgroundColor: "#282a36",
      minHeight: "100vh",
      fontFamily: "Arial",
      color: "#f8f8f2",
    }}>
      {!username ? (
        // If not logged in, show login/register form
        <LoginRegister onLogin={handleLogin} />
      ) : (
        // If logged in, show journal UI
        <div style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <p>
              Logged in as: <span style={{ color: "#50fa7b", fontWeight: "bold" }}>{username}</span>
            </p>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#ff5555",
                color: "#fff",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "0.5rem"
              }}>
              Logout
            </button>
          </div>

          <h1 style={{
            fontFamily: "Cursive",
            fontSize: "2.5rem",
            fontWeight: "600",
            textShadow: "1px 1px 2px rgb(64, 141, 172)",
            color: "#bd93f9",
          }}>My Journal</h1>

          <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Entry Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  fontFamily: "Tacoma",
                  fontSize: "1rem",
                  padding: "0.5rem",
                  width: "100%",
                  backgroundColor: "#1e1e1e",
                  color: "#f1f1f1",
                  border: "1px solid #333",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <textarea
                placeholder="Write your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                style={{
                  fontFamily: "Tacoma",
                  fontSize: "1rem",
                  padding: "0.5rem",
                  width: "100%",
                  backgroundColor: "#1e1e1e",
                  color: "#f1f1f1",
                  border: "1px solid #333",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ff79c6",
                fontSize: "0.9rem",
                color: "#282a36",
                border: "none",
                fontFamily: "Arial Black",
                borderRadius: "4px",
                cursor: "pointer",
              }}>
              Add Entry
            </button>
          </form>

          {entries.length === 0 ? (
            <p>No journal entries yet</p>
          ) : (
            <ul>
              {entries.map(entry => (
                <li key={entry._id} style={{ marginBottom: "1.5rem" }}>
                  {editId === entry._id ? (
                    <form onSubmit={handleUpdate}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
                      />
                      <button type="submit" style={{ marginRight: "0.5rem", backgroundColor: "#8be9fd" }}>Save</button>
                      <button type="button" style={{ backgroundColor: "#6272a4" }} onClick={cancelEdit}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <h3 style={{ fontFamily: "Georgia", fontSize: "1.4rem", fontWeight: "bold" }}>{entry.title}</h3>
                      <p style={{ fontFamily: "Roboto", fontSize: "1rem", lineHeight: "1.6" }}>{entry.content}</p>
                      <small style={{ fontFamily: "Courier New", fontSize: "0.85rem", color: "#6272a4", fontWeight: "550" }}>{new Date(entry.date).toLocaleString()}</small>
                      <br />
                      <button
                        onClick={() => startEditing(entry)}
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.4rem 0.8rem",
                          backgroundColor: "#50fa7b",
                          color: "#000",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "0.5rem"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.4rem 0.8rem",
                          backgroundColor: "#ff5555",
                          color: "#000",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );

}

export default App;
