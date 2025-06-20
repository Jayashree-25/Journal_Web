//useEffect:  lets you run code when the component loads.. like if page loaded, do this..
//useState: to store data
import React, { useEffect, useState } from "react";

function App(){
  //entries: variable to hold journal data, setEntries: update the variable
  const [entries, setEntries] = useState([]); //So at first, entries = []
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/entries")
    .then(res => res.json())  //converts the response to json
    .then(data => setEntries(data))  //saves the entries into our entries state
    .catch(err => console.error("error in finding entries..!"));
  }, []);  // Empty dependency array = run only once on page load

  //handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();  //prevent page reload

    const newEntry = {title, content};

    fetch("http://localhost:5000/entries" , {
      method : "POST",
      headers: {"Content-Type": "application/json"},
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
    fetch(`http://localhost:5000/entries/${id}` , {
      method: "DELETE",
    })
    .then(() => {
      //remove entry
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    })
    .catch(err => console.error("error in deleting entries..!"));
  }

  return(
    <div style={{padding: "2rem", fontFamily: "Arial"}}>
      <h1>My Journal</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Entry Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <textarea
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>

        <button
        type="submit"
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#dc3545",
          fontSize: "0.9rem",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
        }}>
          Add Entry
        </button>
      </form>

      {entries.length === 0 ? (
        <p>No journal entries yet</p>
      ) : (
        <ul>
          {entries.map(entry => (  //loops through every entry
            <li key={entry.id}>
              <h3>{entry.title}</h3>
              <p>{entry.content}</p>
              <small>{new Date(entry.date).toLocaleString()}</small> 

              <br />

              <button
                onClick={() => handleDelete(entry.id)}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.4rem 0.8rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>

            </li>
          ))}
        </ul>
      )}

    </div>
  )
}
export default App;