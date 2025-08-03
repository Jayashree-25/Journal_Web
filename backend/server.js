require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Allow frontend URLs
const allowedOrigins = [
  "https://journal-web-nu.vercel.app",
  "http://localhost:3000",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(bodyParser.json());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err.message));

// ====== Mongoose Schemas ====== //
const entrySchema = new mongoose.Schema({
  title: String,
  content: String,
  username: String,
  date: { type: Date, default: Date.now },
});
const Entry = mongoose.model("Entry", entrySchema);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

// ====== Routes ====== //

// Get entries for a user
app.get("/entries", async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }
  const entries = await Entry.find({ username }).sort({ date: -1 });
  res.json(entries);
});

// Add entry
app.post("/entries", async (req, res) => {
  const { title, content, username } = req.body;
  const newEntry = new Entry({ title, content, username });
  await newEntry.save();
  res.status(201).json(newEntry);
});

// Delete entry
app.delete("/entries/:id", async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Update entry
app.put("/entries/:id", async (req, res) => {
  const updated = await Entry.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title, content: req.body.content },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Entry not found" });
  res.json(updated);
});

// Get all users’ entries
app.get("/entries-all", async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Login
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

  const token = jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, username: user.username });
});

// ====== Start Server ====== //
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
