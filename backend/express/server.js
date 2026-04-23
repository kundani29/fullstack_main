const http = require("http");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const PORT = 5050;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
});

const User = mongoose.model("User", UserSchema);

// Upload folder
const UPLOADS_ROOT_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOADS_ROOT_DIR, { recursive: true });

// Helper
const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
};

// Auth
const getUserFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const server = http.createServer(async (req, res) => {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // ================= LOGIN =================
  if (req.url === "/login" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { email, password } = JSON.parse(body);

      const user = await User.findOne({ email });
      if (!user) {
        return sendJson(res, 401, { success: false, message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return sendJson(res, 401, { success: false, message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id, email }, JWT_SECRET, { expiresIn: "7d" });

      return sendJson(res, 200, { success: true, token });
    });
    return;
  }

  // ================= SIGNUP =================
  if (req.url === "/signup" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const { email, password } = JSON.parse(body);

      if (!email || !password) {
        return sendJson(res, 400, { success: false, message: "Missing fields" });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return sendJson(res, 409, { success: false, message: "User exists" });
      }

      const hash = await bcrypt.hash(password, 10);

      await User.create({
        email,
        passwordHash: hash,
      });

      return sendJson(res, 200, { success: true });
    });
    return;
  }

  // ================= TEST =================
  if (req.url === "/test") {
    const users = await User.find();
    return sendJson(res, 200, users);
  }

  res.writeHead(200);
  res.end("Backend running 🚀");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});