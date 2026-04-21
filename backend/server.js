const http = require("http");

const PORT = process.env.PORT || 5100;

const server = http.createServer((req, res) => {
  // CORS (so frontend can access backend)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Route: /files
  if (req.url === "/files" && req.method === "GET") {
    const data = {
      files: ["file1.txt", "image.png", "document.pdf"]
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(data));
  }

  // Default route
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Backend is running 🚀");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});