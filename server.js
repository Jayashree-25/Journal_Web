const express = require("express");  // Import Express
const bodyParser = require("body-parser");  //parse json request
const fs = require("fs");  //for read/write
const cors = require("cors");  //allow frontend access

const app = express();  //create express app
const PORT = 5000;

app.use(cors());   // Enable frontend access
app.use(bodyParser.json());   // Accept JSON input


function readEntries(){
    const data = fs.readFileSync("entries.json", "utf8");   //doubt
    return JSON.parse(data);  //convert to JavaScript array 
}

function writeEntries(entries){
    //entries: This is the JavaScript object or array you want to convert to a JSON string. 
    //null: This means no special filtering (it includes all properties). 
    //This specifies indentation of 2 spaces per level, making the output pretty-printed and easy to read.
    fs.writeFileSyn("entries.json", JSON.stringify(entries,null,2));   //(value, replacer, space)
}

//GET all entries
app.get("/entries", (req,res) => {
    const entries = readEntries();
    res.json(entries);
});

//POST(add) an entry
app.post("/entries", (req,res) => {
    const entries = readEntries();
    const newEntry = {
        id: Date.now().toString(),  //unique id
        title: req.body.title,
        content: req.body.content,
        date: new Date().toISOString()
    };
    entries.push(newEntry);
    writeEntries(entries);
    res.status(201).json(newEntry);  //this step sends http response back to the client.. with code 201 means "created"
});

//DELETE an entry by id
app.delete("/entries/:id", (req,res) => {
    const entries = readEntries();
    const filtered = entries.filter(entry => entry.id !== req.params.id);
    writeEntries(filtered);
    res.status(204).send(); //success with no response body
});

app.listen(PORT, () => {
    console.log(`server is running well with ${PORT}`);
});