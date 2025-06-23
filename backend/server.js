const express = require("express");  // Import Express
const bodyParser = require("body-parser");  //parse json request
// const fs = require("fs");  //for read/write
const cors = require("cors");  //allow frontend access
const mongoose = require("mongoose");  //Import mongoose

const app = express();  //create express app
const PORT = 5000;

app.use(cors());   // Enable frontend access
app.use(bodyParser.json());   // Accept JSON input
app.use(express.json());


// function readEntries(){
//     const data = fs.readFileSync("entries.json", "utf8");   //doubt
//     return JSON.parse(data);  //convert to JavaScript array 
// }

// function writeEntries(entries){
//     //entries: This is the JavaScript object or array you want to convert to a JSON string. 
//     //null: This means no special filtering (it includes all properties). 
//     //This specifies indentation of 2 spaces per level, making the output pretty-printed and easy to read.
//     fs.writeFileSync("entries.json", JSON.stringify(entries,null,2));   //(value, replacer, space)
// }

//-------mongoDB connection-------//
mongoose.connect("mongodb://localhost:27017/journalDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => { console.log("mongoDB connected") })
    .catch(err => console.error("connection error"));

//-------mongoDB schema and model----------//
const entrySchema = new mongoose.Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
});
const Entry = mongoose.Model("Entry", entrySchema);

//GET all entries
app.get("/entries", async (req, res) => {
    const entries = await Entry.find().sort({ date: -1 });  //fetches sort them.. await ensures func wait until the db returns the result 
    res.json(entries);
});

//POST(add) an entry
app.post("/entries", async (req, res) => {
    const entries = await new Entry(req.body).save();
    res.status(201).json(entries);  //http code 201 means created
});

//DELETE an entry by id
app.delete("/entries/:id", async (req, res) => {
    await Entry.findByIdAndDelete(req.params.id); //gets the value of id parameter from the URL
    res.sendStatus(204);
});

//UPDATE 
app.put("/entries/:id", async (req, res) => {
    const updated = await Entry.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        content: req.body.content,
    }, { new: true });

    if (!updated) return res.status(404).json({ message: "entry not found" });
    res.json(updated);
});

app.listen(PORT, () => {
    console.log(`server is running well with ${PORT}`);
});