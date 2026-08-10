require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-do-not-use-in-prod";

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

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

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

// ====== Auth Middleware ====== //
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ====== Routes ====== //

// Get entries for the authenticated user
app.get("/entries", authenticate, async (req, res) => {
  try {
    if (req.user.username !== req.query.username) {
      return res.status(403).json({ error: "Not authorized to view these entries" });
    }
    const entries = await Entry.find({ username: req.user.username }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error("GET /entries failed:", err.message);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Add entry
app.post("/entries", authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const newEntry = new Entry({ title, content, username: req.user.username });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error("POST /entries failed:", err.message);
    res.status(500).json({ error: "Failed to add entry" });
  }
});

// Delete entry (owner only)
app.delete("/entries/:id", authenticate, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }
    if (entry.username !== req.user.username) {
      return res.status(403).json({ error: "Not authorized to delete this entry" });
    }
    await Entry.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    console.error("DELETE /entries/:id failed:", err.message);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

// Update entry (owner only)
app.put("/entries/:id", authenticate, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }
    if (entry.username !== req.user.username) {
      return res.status(403).json({ error: "Not authorized to edit this entry" });
    }
    const updated = await Entry.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, content: req.body.content },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("PUT /entries/:id failed:", err.message);
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// Get all users' entries (authenticated users only)
app.get("/entries-all", authenticate, async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 }).limit(200);
    res.json(entries);
  } catch (err) {
    console.error("GET /entries-all failed:", err.message);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("POST /register failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
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
  } catch (err) {
    console.error("POST /login failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ====== Start Server ====== //
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
