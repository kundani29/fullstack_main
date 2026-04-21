const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5050; // ✅ match frontend
const UPLOADS_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
};

const sanitizeFilename = (name) =>
  path.basename(name).replace(/[^\w.\-() ]/g, "_");

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

const server = http.createServer((req, res) => {

  // ✅ CORS (important)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle OPTIONS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // ✅ LOGIN ROUTE
  if (req.url === "/login" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const { email, password } = JSON.parse(body);

      console.log("Login request:", email, password);

      // simple check (you can improve later)
      if (email && password) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false }));
      }
    });

    return;
  }

  // ✅ SIGNUP ROUTE
  if (req.url === "/signup" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const { email, password } = JSON.parse(body);

      console.log("Signup request:", email, password);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });

    return;
  }

  // ✅ FILE LIST
  if (req.url === "/files" && req.method === "GET") {
    fs.readdir(UPLOADS_DIR, (err, files) => {
      if (err) return sendJson(res, 500, { success: false, files: [] });
      return sendJson(res, 200, { success: true, files });
    });
    return;
  }

  // ✅ FILE UPLOAD
  if (req.url === "/upload" && req.method === "POST") {
    parseMultipartFile(req, (err, parsed) => {
      if (err) return sendJson(res, 400, { success: false, message: err.message });

      const filePath = path.join(UPLOADS_DIR, parsed.fileName);
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
    const fileName = sanitizeFilename(decodeURIComponent(req.url.replace("/uploads/", "")));
    const filePath = path.join(UPLOADS_DIR, fileName);

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
    const fileName = sanitizeFilename(decodeURIComponent(req.url.replace("/delete/", "")));
    const filePath = path.join(UPLOADS_DIR, fileName);

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