const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  // Read data from connection
  socket.on("data", (data) => {
    const CRLF = "\r\n\r\n";
    const { method, path, protocol } = processHttpRequest(data);

    if (method === "GET") {
      const urlParams = path.split("/");
      const contentToSend = urlParams[1];
      const contentLength = contentToSend.length;

      socket.write(
        ` ${protocol} 200 OK ${CRLF}` +
          `Content-Type: text/plain${CRLF}` +
          `Content-Length: ${contentLength}${CRLF}` +
          `${contentToSend}${CRLF}`,
      );
    }
    socket.end();
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");

function processHttpRequest(data) {
  const decodedToString = data.toString();
  const [startLine, ...headers] = decodedToString.split("\r\n");
  const [method, path, protocol] = startLine.split(" ");

  return { method, path, protocol };
}
