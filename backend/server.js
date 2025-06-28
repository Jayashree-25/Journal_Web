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
    username: String,
    date: { type: Date, default: Date.now },
});
const Entry = mongoose.model("Entry", entrySchema);

//-----bcryptjs (password)-----//
const bcryptjs = require("bcryptjs");
//user schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});
const User = mongoose.model("User", userSchema);

//GET all entries
app.get("/entries", async (req, res) => {
    const entries = await Entry.find().sort({ date: -1 });  //fetches sort them.. await ensures func wait until the db returns the result 
    res.json(entries);
});

//POST(add) an entry
app.post("/entries", async (req, res) => {
    const { title, content, username } = req.body;
    const newEntry = new Entry({ title, content, username });
    await newEntry.save();
    res.status(201).json(newEntry);  //http code 201 means created
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
    }, { new: true }); //this tells mongoose to return the updated document

    if (!updated) return res.status(404).json({ message: "entry not found" });
    res.json(updated);
});

//-----For user-----//
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        if (err.code === 11000) {  //duplicate username
            res.status(400).json({ error: "Username already exists" });
        } else {
            res.status(500).json({ error: "Server error" })
        }
    }
});

//-----Login Route-----//
const jwt = require("jsonwebtoken");
const JWT_SECRET = "mysecretkey";

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    //Create JWT token
    const token = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: "2h" }
    );

    res.json({ token, username: user.username });
})

app.listen(PORT, () => {
    console.log(`server is running well with ${PORT}`);
});