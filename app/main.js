const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  // Read data from connection
  socket.on("data", (data) => {
    const CRLF = "\r\n";
    const RESPONSE_OK = "200 OK";
    const RESPONSE_NOT_FOUND = "404 Not Found";

    const { method, path, protocol } = processHttpRequest(data);
    const urlParams = path.split("/");
    const apiMethod = urlParams[1];

    if (method === "GET" && apiMethod === "echo") {
      const contentToSend = urlParams[2];
      const contentLength = contentToSend.length;

      console.log(urlParams);
      const response =
        `${protocol} ${RESPONSE_OK} ${CRLF}` +
        `Content-Type: text/plain${CRLF}` +
        `Content-Length: ${contentLength}${CRLF}` +
        `${contentToSend}${CRLF}`;

      console.log(response);
      socket.write(response);
    } else {
      socket.write(`${protocol} ${RESPONSE_NOT_FOUND} ${CRLF.repeat(2)}`);
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
