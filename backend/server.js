require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic();

// ── MongoDB Connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected")).catch(e => console.error("❌ MongoDB error:", e));

// ── Schemas ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const researchSchema = new mongoose.Schema({
  userId: String,
  url: String,
  title: String,
  platform: String,
  viralScore: Number,
  summary: String,
  hook: String,
  thumbnail: String,
  timing: String,
  emotion: String,
  algorithm: String,
  actionableSteps: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Research = mongoose.model("Research", researchSchema);

// ── JWT Middleware ───────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ── Auth Routes ──────────────────────────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── AI Analysis Function ─────────────────────────────────────────────────────
async function analyzeContent(url, platform, title = "") {
  try {
    const prompt = `Analyze this ${platform} content for viral potential:
URL: ${url}
Title: ${title || "N/A"}

Provide a detailed analysis in JSON format with:
{
  "viralScore": 1-100,
  "summary": "Brief overview",
  "hook": "What makes the first 3 seconds compelling?",
  "thumbnail": "Visual appeal analysis",
  "timing": "Best posting times and frequency",
  "emotion": "What emotions drive engagement?",
  "algorithm": "Algorithm signals (watch time, comments, saves)",
  "actionableSteps": "What can creators learn and apply?"
}`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      viralScore: Math.floor(Math.random() * 100),
      summary: "Unable to analyze",
      hook: "N/A",
      thumbnail: "N/A",
      timing: "N/A",
      emotion: "N/A",
      algorithm: "N/A",
      actionableSteps: "N/A",
    };

    return {
      ...analysis,
      url,
      platform,
      title,
    };
  } catch (e) {
    console.error("AI Analysis Error:", e);
    return {
      viralScore: 50,
      summary: "Analysis unavailable",
      hook: "Error analyzing content",
      thumbnail: "N/A",
      timing: "N/A",
      emotion: "N/A",
      algorithm: "N/A",
      actionableSteps: "Please try again",
      url,
      platform,
      title,
    };
  }
}

// ── Analyze Route ───────────────────────────────────────────────────────────
app.post("/api/analyze", verifyToken, async (req, res) => {
  try {
    const { url, platform, title } = req.body;
    if (!url || !platform) return res.status(400).json({ message: "Missing URL or platform" });

    const analysis = await analyzeContent(url, platform, title);
    res.json(analysis);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Trending Route ──────────────────────────────────────────────────────────
app.get("/api/trending", verifyToken, async (req, res) => {
  try {
    const { platform, niche } = req.query;
    
    // Mock trending videos (replace with real API if needed)
    const mockTrending = [
      {
        title: `Trending ${niche} Video on ${platform}`,
        url: `https://${platform.toLowerCase()}.com/video/123`,
        views: "1.2M",
        viralScore: Math.floor(Math.random() * 100),
      },
      {
        title: `How to succeed in ${niche}`,
        url: `https://${platform.toLowerCase()}.com/video/456`,
        views: "850K",
        viralScore: Math.floor(Math.random() * 100),
      },
      {
        title: `${niche} tips that work`,
        url: `https://${platform.toLowerCase()}.com/video/789`,
        views: "2.1M",
        viralScore: Math.floor(Math.random() * 100),
      },
    ];

    res.json(mockTrending);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Research Routes ─────────────────────────────────────────────────────────
app.post("/api/research", verifyToken, async (req, res) => {
  try {
    const { url, platform, title, viralScore, summary, hook, thumbnail, timing, emotion, algorithm, actionableSteps } = req.body;
    
    const research = new Research({
      userId: req.userId,
      url,
      platform,
      title,
      viralScore,
      summary,
      hook,
      thumbnail,
      timing,
      emotion,
      algorithm,
      actionableSteps,
    });

    await research.save();
    res.json({ message: "Saved", id: research._id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get("/api/research", verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { userId: req.userId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
      ];
    }

    const research = await Research.find(query).sort({ createdAt: -1 });
    res.json(research);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.delete("/api/research/:id", verifyToken, async (req, res) => {
  try {
    await Research.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Server is running" });
});

// ── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
