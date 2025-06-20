//useEffect:  lets you run code when the component loads.. like if page loaded, do this..
//useState: to store data
import React, { useEffect, useState } from "react";

function App(){
  //entries: variable to hold journal data, setEntries: update the variable
  const [entries, setEntries] = useState([]); //So at first, entries = []

  useEffect(() => {
    fetch("http://localhost:5000/entries")
    .then(res => res.json())  //converts the response to json
    .then(data => setEntries(data))  //saves the entries into our entries state
    .catch(err => console.error("error in finding entries..!"));
  }, []);  // Empty dependency array = run only once on page load

  return(
    <div style={{padding: "2rem", fontFamily: "Arial"}}>
      <h1>My Journal</h1>

      {entries.length === 0 ? (
        <p>No journal entries yet</p>
      ) : (
        <ul>
          {entries.map(entry => (  //loops through every entry
            <li key={entry.id}>
              <h3>{entry.title}</h3>
              <p>{entry.content}</p>
              <small>{new Date(entry.date).toLocaleString()}</small> 
            </li>
          ))}
        </ul>
      )}

    </div>
  )
}
export default App;