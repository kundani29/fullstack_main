const http = require('http');

const server = http.createServer((req , res)=> {
    res.end("hello");
});

server.listen(5100, () => {
    console.log("server is running on http://localhost:5100");
});
