const http = require("http");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PORT = 5050; // ✅ match frontend
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const UPLOADS_ROOT_DIR = path.join(__dirname, "uploads");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_ROOT_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf-8");

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
};

const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
};

const sanitizeFilename = (name) =>
  path.basename(name).replace(/[^\w.\-() ]/g, "_");

const sanitizeUserId = (value) => value.replace(/[^\w-]/g, "_");

const getUserUploadsDir = (userId) => {
  const dir = path.join(UPLOADS_ROOT_DIR, sanitizeUserId(userId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const parseJsonBody = (req, callback) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (error) {
      callback(new Error("Invalid JSON payload"));
    }
  });
  req.on("error", callback);
};

const parseMultipartFile = (req, callback) => {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) {
    return callback(new Error("Invalid multipart request"));
  }

  const boundary = `--${boundaryMatch[1]}`;
  const chunks = [];

  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    try {
      const bodyBuffer = Buffer.concat(chunks);
      const bodyText = bodyBuffer.toString("latin1");
      const boundaryIndex = bodyText.indexOf(boundary);

      if (boundaryIndex === -1) {
        return callback(new Error("Boundary not found"));
      }

      const fileNameMatch = bodyText.match(/filename="([^"]+)"/);
      if (!fileNameMatch || !fileNameMatch[1]) {
        return callback(new Error("File not provided"));
      }

      const safeFileName = sanitizeFilename(fileNameMatch[1]);
      const dataStart = bodyText.indexOf("\r\n\r\n", boundaryIndex);
      if (dataStart === -1) {
        return callback(new Error("File data not found"));
      }

      const fileStart = dataStart + 4;
      const fileEnd = bodyText.indexOf(`\r\n${boundary}`, fileStart);
      if (fileEnd === -1) {
        return callback(new Error("File boundary end not found"));
      }

      const fileBinary = bodyText.slice(fileStart, fileEnd);
      const fileBuffer = Buffer.from(fileBinary, "latin1");

      callback(null, { fileName: safeFileName, fileBuffer });
    } catch (error) {
      callback(error);
    }
  });
  req.on("error", callback);
};

const getUserFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload || null;
  } catch (error) {
    return null;
  }
};

const getUserFromQueryToken = (req) => {
  try {
    const fullUrl = new URL(req.url, "http://localhost");
    const token = fullUrl.searchParams.get("token");
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const server = http.createServer((req, res) => {

  // ✅ CORS (important)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle OPTIONS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // ✅ LOGIN ROUTE
  if (req.url === "/login" && req.method === "POST") {
    parseJsonBody(req, async (error, body) => {
      if (error) return sendJson(res, 400, { success: false, message: error.message });

      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";
      if (!email || !password) {
        return sendJson(res, 400, { success: false, message: "Email and password are required" });
      }

      const users = readUsers();
      const user = users.find((u) => u.email === email);
      if (!user) return sendJson(res, 401, { success: false, message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return sendJson(res, 401, { success: false, message: "Invalid credentials" });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return sendJson(res, 200, { success: true, token, user: { email: user.email } });
    });
    return;
  }

  // ✅ SIGNUP ROUTE
  if (req.url === "/signup" && req.method === "POST") {
    parseJsonBody(req, async (error, body) => {
      if (error) return sendJson(res, 400, { success: false, message: error.message });

      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";
      if (!email || !password) {
        return sendJson(res, 400, { success: false, message: "Email and password are required" });
      }
      if (password.length < 6) {
        return sendJson(res, 400, { success: false, message: "Password must be at least 6 characters" });
      }

      const users = readUsers();
      if (users.some((u) => u.email === email)) {
        return sendJson(res, 409, { success: false, message: "User already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        email,
        passwordHash
      };
      users.push(user);
      writeUsers(users);
      getUserUploadsDir(user.id);

      return sendJson(res, 200, { success: true });
    });
    return;
  }

  if (req.url === "/me" && req.method === "GET") {
    const authUser = getUserFromRequest(req);
    if (!authUser) return sendJson(res, 401, { success: false, message: "Unauthorized" });
    return sendJson(res, 200, { success: true, user: { email: authUser.email } });
  }

  // ✅ FILE LIST
  if (req.url === "/files" && req.method === "GET") {
    const authUser = getUserFromRequest(req);
    if (!authUser) return sendJson(res, 401, { success: false, message: "Unauthorized" });

    const uploadsDir = getUserUploadsDir(authUser.userId);
    fs.readdir(uploadsDir, (err, files) => {
      if (err) return sendJson(res, 500, { success: false, files: [] });
      return sendJson(res, 200, { success: true, files });
    });
    return;
  }

  // ✅ FILE UPLOAD
  if (req.url === "/upload" && req.method === "POST") {
    const authUser = getUserFromRequest(req);
    if (!authUser) return sendJson(res, 401, { success: false, message: "Unauthorized" });

    parseMultipartFile(req, (err, parsed) => {
      if (err) return sendJson(res, 400, { success: false, message: err.message });

      const uploadsDir = getUserUploadsDir(authUser.userId);
      const filePath = path.join(uploadsDir, parsed.fileName);
      fs.writeFile(filePath, parsed.fileBuffer, (writeErr) => {
        if (writeErr) {
          return sendJson(res, 500, { success: false, message: "Upload failed" });
        }
        return sendJson(res, 200, { success: true, file: parsed.fileName });
      });
    });
    return;
  }

  // ✅ FILE DOWNLOAD/VIEW
  if (req.url.startsWith("/uploads/") && req.method === "GET") {
    const authUser = getUserFromRequest(req) || getUserFromQueryToken(req);
    if (!authUser) {
      res.writeHead(401, { "Content-Type": "text/plain" });
      res.end("Unauthorized");
      return;
    }

    const filePathPart = req.url.split("?")[0];
    const fileName = sanitizeFilename(decodeURIComponent(filePathPart.replace("/uploads/", "")));
    const uploadsDir = getUserUploadsDir(authUser.userId);
    const filePath = path.join(uploadsDir, fileName);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File not found");
      return;
    }

    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { "Content-Type": "application/octet-stream" });
    stream.pipe(res);
    return;
  }

  // ✅ FILE DELETE
  if (req.url.startsWith("/delete/") && req.method === "DELETE") {
    const authUser = getUserFromRequest(req);
    if (!authUser) return sendJson(res, 401, { success: false, message: "Unauthorized" });

    const fileName = sanitizeFilename(decodeURIComponent(req.url.replace("/delete/", "")));
    const uploadsDir = getUserUploadsDir(authUser.userId);
    const filePath = path.join(uploadsDir, fileName);

    fs.unlink(filePath, (err) => {
      if (err) return sendJson(res, 404, { success: false, message: "File not found" });
      return sendJson(res, 200, { success: true });
    });
    return;
  }

  // ✅ DEFAULT ROUTE
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Backend is running 🚀");

});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});