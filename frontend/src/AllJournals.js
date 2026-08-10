import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };
}

function AllJournals({ username }) {
    const [entries, setEntries] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}/entries-all`, { headers: authHeaders() })
            .then(res => {
                if (res.status === 401) {
                    alert("Session expired. Please login again.");
                    navigate("/");
                    throw new Error("Session expired");
                }
                return res.json();
            })
            .then(data => setEntries(data))
            .catch(err => console.error("error in fetching:", err))
    }, [navigate]);

    const startEditing = (entry) => {
        setEditId(entry._id);
        setEditTitle(entry.title);
        setEditContent(entry.content);
    };

    const cancelEdit = () => {
        setEditId(null);  //means no item is currently being edited
        setEditTitle("");  //resets the editing title to an empty string
        setEditContent("");  //clears the editing content
    }

    const handleUpdate = (e) => {
        e.preventDefault();

        fetch(`${API_URL}/entries/${editId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ title: editTitle, content: editContent }),
        })
            .then(res => {
                if (!res.ok) throw new Error(`Update failed: ${res.status}`);
                return res.json();
            })
            .then(updated => {
                //prev.map(...) loops over the existing list
                setEntries(prev => prev.map(entry =>
                    entry._id === editId ? updated : entry  //checks.. if true, it replaces that entry with the new one
                ));
                cancelEdit();
            })
            .catch(err => console.error("error in updating:", err));
    };

    const handleDelete = (id) => {
        fetch(`${API_URL}/entries/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        })
            .then(res => {
                if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
                setEntries(prev => prev.filter(entry => entry._id !== id));
            })
            .catch(err => console.error("error in deleting:", err));
    };

    return (
        <div style={{
            padding: "2rem",
            fontFamily: "Arial",
            backgroundColor: "#282a36",
            minHeight: "100vh",
            color: "#f8f8f2",
        }}>
            <h2 style={{
                color: "#bd93f9",
                fontSize: "2rem",
                marginBottom: "1rem",
            }}>
                All Journals
            </h2>

            {entries.length === 0 ? (
                <p>No entries available</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {entries.map(entry => (
                        <li key={entry._id} style={{ marginBottom: "2rem" }}>
                            {editId === entry._id ? (

                                <form onSubmit={handleUpdate}>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            marginBottom: "0.5rem",
                                        }}
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            marginBottom: "0.5rem",
                                        }}
                                    />

                                    <button type="submit" style={{ marginRight: "0.5rem", backgroundColor: "#8be9fd" }}>Save</button>

                                    <button type="button" style={{ backgroundColor: "#6272a4" }} onClick={cancelEdit}>Cancel</button>

                                </form>
                            ) : (
                                <>
                                    <h3 style={{
                                        fontFamily: "Georgia",
                                        fontSize: "1.4rem",
                                        fontWeight: "bold"
                                    }}>
                                        {entry.title}
                                    </h3>
                                    <p style={{
                                        fontSize: "1rem",
                                        lineHeight: "1.6"
                                    }}>
                                        {entry.content}
                                    </p>
                                    <small style={{
                                        color: "#6272a4",
                                        fontWeight: "550"
                                    }}>
                                        By <span style={{ color: "#50fa7b" }}>
                                            {entry.username}
                                        </span>
                                    </small>
                                    <br />

                                    {username === entry.username && (
                                        <>
                                            <button
                                                onClick={() => startEditing(entry)}
                                                style={{
                                                    marginTop: "0.5rem",
                                                    marginRight: "0.5rem",
                                                    padding: "0.4rem 0.8rem",
                                                    backgroundColor: "#50fa7b",
                                                    color: "#000",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
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
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default AllJournals;