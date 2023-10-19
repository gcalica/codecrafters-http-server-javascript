const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  // Read data from connection
  socket.on("data", (data) => {
    const httpRequest = data.toString().split("\r\n");
    const startLine = httpRequest[0].split(" ");
    // const httpMethod = startLine[0];
    const path = startLine[1];
    // const httpVersion = startLine[2];

    console.log(httpRequest + "\n" + startLine + "\n" + path);
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else {
      socket.write("HTTP/1.1 404 Not Found");
    }
    socket.end();
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
