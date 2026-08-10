import React, { useEffect, useRef, useState } from "react";
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatCardDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();
}

function formatCardTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function QuillIllustration() {
  return (
    <svg className="journal-home__editor-quill" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M38 6 C 30 10 22 20 18 34 L 14 40 L 22 38 C 32 30 38 18 40 8 Z" stroke="#8B5E3C" strokeWidth="1.4" strokeLinejoin="round" opacity="0.6" />
      <path d="M14 40 L 20 34" stroke="#8B5E3C" strokeWidth="1.1" opacity="0.6" />
      <path d="M30 16 L 24 24" stroke="#8B5E3C" strokeWidth="0.9" opacity="0.4" />
    </svg>
  );
}

function CardFlora({ corner }) {
  return (
    <svg className={`journal-home__card-flora journal-home__card-flora--${corner}`} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {corner === "tr" ? (
        <g stroke="#7A8068" strokeLinecap="round" opacity="0.4">
          <path d="M50 16 C 42 16 32 19 25 26" strokeWidth="1.2" />
          <path d="M36 23 q -8 -1 -11 -8 q 8 -3 11 8" strokeWidth="1" />
          <path d="M43 19 q -7 -2 -9 -9 q 7 -2 9 9" strokeWidth="1" />
        </g>
      ) : (
        <g stroke="#7A8068" strokeLinecap="round" opacity="0.4">
          <path d="M14 48 C 22 48 30 45 37 38" strokeWidth="1.2" />
          <path d="M28 41 q 8 -1 11 -8 q -8 -3 -11 8" strokeWidth="1" />
          <path d="M21 46 q 7 -2 9 -9 q -7 -2 -9 9" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}

// Home page when user is logged in
function JournalHome({ entries, setEntries, username, handleLogout }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [sortOpen, setSortOpen] = useState(false);
  const menuRef = useRef(null);
  const sortRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!openMenu) return;
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenu]);

  useEffect(() => {
    if (!sortOpen) return;
    const handleOutsideClick = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [sortOpen]);

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

  const resetEditor = () => {
    setEditId(null);
    setTitle("");
    setContent("");
  };

  const openEditorForEdit = (entry) => {
    setEditId(entry._id);
    setTitle(entry.title);
    setContent(entry.content);
    setOpenMenu(null);
    document.getElementById("entry-title")?.focus();
    document.getElementById("entry-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editId) {
      fetch(`${API_URL}/entries/${editId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ title, content }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Update failed: ${res.status}`);
          return res.json();
        })
        .then((updated) => {
          setEntries((prev) => prev.map((entry) => (entry._id === editId ? updated : entry)));
          resetEditor();
        })
        .catch((err) => console.error("error in updating entry:", err));
      return;
    }

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
        setDeleteId(null);
      })
      .catch((err) => console.error("error in deleting entry:", err));
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    return sortBy === "latest" ? tb - ta : ta - tb;
  });

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

        <div className="journal-home__greeting">
          <h2 className="journal-home__greeting-title">
            {getGreeting()}, {username}.
          </h2>
          <svg className="journal-home__greeting-underline" viewBox="0 0 210 10" fill="none" aria-hidden="true">
            <path d="M3 6 C 30 3.5, 55 8, 85 5.5 C 115 3, 145 8, 170 6 C 183 5.2, 194 5.8, 207 5.2" stroke="#8B5E3C" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="journal-home__greeting-sub">What&rsquo;s on your mind today?</p>
        </div>

        <svg className="journal-home__greeting-flora" viewBox="0 0 120 140" fill="none" aria-hidden="true">
          <path d="M30 130 C 34 90 52 60 100 30" stroke="#7A8068" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
          <g stroke="#7A8068" strokeWidth="1" strokeLinecap="round" opacity="0.45">
            <path d="M48 104 q -10 -5 -12 -15 q 12 1 12 15 Z" />
            <path d="M48 104 q 11 -7 7 -18 q -13 3 -7 18 Z" />
            <path d="M66 86 q -10 -4 -12 -14 q 12 1 12 14 Z" />
            <path d="M82 70 q -9 -4 -11 -13 q 11 1 11 13 Z" />
          </g>
        </svg>

        <div className="journal-home__editor">
          <span className="journal-home__binding journal-home__binding--1" aria-hidden="true" />
          <span className="journal-home__binding journal-home__binding--2" aria-hidden="true" />
          <span className="journal-home__binding journal-home__binding--3" aria-hidden="true" />

          <div className="journal-home__editor-head">
            <QuillIllustration />
            <div>
              <h3 className="journal-home__editor-title">{editId ? "Edit Journal Entry" : "New Journal Entry"}</h3>
              <p className="journal-home__editor-sub">
                {editId ? "Make changes to your entry." : "Capture your thoughts, ideas and memories."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="journal-home__editor-form">
            <div className="journal-home__editor-grid">
              <div className="journal-home__field">
                <label htmlFor="entry-title">Title</label>
                <input
                  id="entry-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your entry a title..."
                  required
                />
              </div>
              <div className="journal-home__field">
                <label htmlFor="entry-content">Your thoughts</label>
                <textarea
                  id="entry-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your thoughts..."
                  required
                />
              </div>
            </div>
            <div className="journal-home__editor-actions">
              {editId && (
                <button type="button" className="journal-home__editor-cancel" onClick={resetEditor}>
                  Cancel
                </button>
              )}
              <button type="submit" className="journal-home__save">
                {editId ? "Save Changes →" : "Save Entry →"}
              </button>
            </div>
          </form>
        </div>

        <div className="journal-home__section">
          <div>
            <h3 className="journal-home__section-title">Your Journal</h3>
            <p className="journal-home__section-sub">Memories, thoughts and moments <span aria-hidden="true">✦</span></p>
          </div>
          <div className="journal-home__sort" ref={sortRef}>
            <button
              type="button"
              className="journal-home__sort-btn"
              onClick={() => setSortOpen(!sortOpen)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              Sort by: {sortBy === "latest" ? "Latest" : "Oldest"} <span className="journal-home__sort-caret" aria-hidden="true">▾</span>
            </button>
            {sortOpen && (
              <div className="journal-home__sort-drop" role="listbox">
                <button
                  type="button"
                  role="option"
                  aria-selected={sortBy === "latest"}
                  className={sortBy === "latest" ? "journal-home__sort-option journal-home__sort-option--active" : "journal-home__sort-option"}
                  onClick={() => { setSortBy("latest"); setSortOpen(false); }}
                >
                  Latest
                </button>
                <button
                  type="button"
                  role="option"
                  aria-selected={sortBy === "oldest"}
                  className={sortBy === "oldest" ? "journal-home__sort-option journal-home__sort-option--active" : "journal-home__sort-option"}
                  onClick={() => { setSortBy("oldest"); setSortOpen(false); }}
                >
                  Oldest
                </button>
              </div>
            )}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="journal-home__empty">
            <p className="journal-home__empty-title">Your journal is waiting.</p>
            <p className="journal-home__empty-sub">Start writing your first entry and give your thoughts a place to live.</p>
            <button
              type="button"
              className="journal-home__empty-btn"
              onClick={() => document.getElementById("entry-title")?.focus()}
            >
              + Create your first entry
            </button>
          </div>
        ) : (
          <ul className={`journal-home__grid ${entries.length === 1 ? "journal-home__grid--single" : ""}`}>
            {sortedEntries.map((entry, index) => (
              <li
                key={entry._id}
                className={`journal-home__card ${openMenu === entry._id ? "journal-home__card--menu-open" : ""}`}
              >
                {(index % 3 === 0 || index % 3 === 1) && (
                  <CardFlora corner={index % 3 === 0 ? "tr" : "bl"} />
                )}

                {deleteId === entry._id ? (
                  <div className="journal-home__card-confirm" role="alertdialog" aria-label="Delete entry confirmation">
                    <p className="journal-home__card-confirm-text">Delete this journal entry?</p>
                    <div className="journal-home__card-confirm-actions">
                      <button type="button" className="journal-home__card-confirm-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                      <button type="button" className="journal-home__card-confirm-delete" onClick={() => handleDelete(entry._id)}>Delete</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="journal-home__card-head">
                      <span className="journal-home__card-date">{formatCardDate(entry.date)}</span>
                      <div
                        className="journal-home__card-menu"
                        ref={openMenu === entry._id ? menuRef : null}
                      >
                        <button
                          type="button"
                          className="journal-home__card-menu-btn"
                          aria-label="Entry actions"
                          aria-haspopup="menu"
                          aria-expanded={openMenu === entry._id}
                          onClick={() => setOpenMenu(openMenu === entry._id ? null : entry._id)}
                        >
                          •••
                        </button>
                        {openMenu === entry._id && (
                          <div className="journal-home__card-menu-drop" role="menu">
                            <button type="button" role="menuitem" onClick={() => openEditorForEdit(entry)}>Edit entry</button>
                            <button type="button" role="menuitem" onClick={() => { setOpenMenu(null); setDeleteId(entry._id); }}>Delete entry</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <h4 className="journal-home__card-title">{entry.title}</h4>
                    <p className="journal-home__card-body">{entry.content}</p>
                    <span className="journal-home__card-time">{formatCardTime(entry.date)}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
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
