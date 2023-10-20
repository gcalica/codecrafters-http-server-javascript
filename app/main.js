const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const CRLF = "\r\n";
const HTTP_CODE = {
  OK: "200 OK",
  NOT_FOUND: "404 Not Found",
};

const RESPONSE_OK = "200 OK";
const RESPONSE_NOT_FOUND = "404 Not Found";

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  // Read data from connection
  socket.on("data", (data) => {
    const HTTP_VERBS = {
      GET: "GET",
    };
    const { headers, method, path, protocol } = parseHttpRequest(data);

    switch (method) {
      case HTTP_VERBS.GET:
        processGetHttpRequest(socket, headers, path, protocol);
        break;
      default:
        break;
    }
    socket.end();
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");

function parseHttpRequest(data) {
  const decodedToString = data.toString();
  const [startLine, ...headers] = decodedToString.split("\r\n");
  const [method, path, protocol] = startLine.split(" ");

  return { headers, method, path, protocol };
}

function processGetHttpRequest(socket, headers, path, protocol) {
  const urlParams = path.substring(1).split("/");
  const apiAction = urlParams[0];

  if (path === "/") {
    socket.write(`${protocol} ${RESPONSE_OK} ${CRLF.repeat(2)}`);
  } else if (apiAction === "echo") {
    const contentToSend = path.substring("/echo/".length);
    const contentLength = contentToSend.length;

    const response =
      `${protocol} ${RESPONSE_OK}${CRLF}` +
      `Content-Type: text/plain${CRLF}` +
      `Content-Length: ${contentLength}${CRLF.repeat(2)}` +
      `${contentToSend}${CRLF}`;

    console.log(response);
    socket.write(response);
  } else if (apiAction === "user-agent") {
    console.log(headers);
    const userAgentHeaderIndex = headers.indexOf("User-Agent: ");
    console.log(userAgentHeaderIndex);
    const userAgentHeader = headers[userAgentHeaderIndex];
    console.log(userAgentHeader);
    const parsedUserAgent = userAgentHeader.split(" ")[1];

    const contentLength = parsedUserAgent.length;

    const response = new ResponseBuilder()
      .statusLine(protocol, HTTP_CODE.OK)
      .headers("text/plain", contentLength)
      .content(parsedUserAgent)
      .createResponse();

    console.log(response);
    socket.write(response);
  } else {
    socket.write(`${protocol} ${RESPONSE_NOT_FOUND} ${CRLF.repeat(2)}`);
  }
}

class ResponseBuilder {
  constructor() {
    this.response = "";
  }

  createResponse() {
    return this.response;
  }

  statusLine(protocol, statusCode) {
    this.response += `${protocol} ${statusCode}${CRLF}`;
  }

  headers(contentType, contentLength) {
    this.response +=
      `Content-Type: ${contentType}${CRLF}` +
      `Content-Length: ${contentLength}${CRLF.repeat(2)}`;
  }

  content(content) {
    this.response += `${content}${CRLF}`;
  }
}
