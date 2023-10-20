const net = require("net");
const fs = require("fs");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// -------------------- ARGS  -------------------
const args = process.argv.slice(2); // trim first two elements (node, app/main.js)
let directory;

if (args.length > 0) {
  if (args[0] === "--directory") {
    directory = args[1];
  }
}

// -------------------- SERVER  -------------------
const CRLF = "\r\n";
const HTTP_CODE = {
  OK: "200 OK",
  NOT_FOUND: "404 Not Found",
};

const server = net.createServer((socket) => {
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
    // server.close();
  });
});

server.listen(4221, "localhost");

// -------------------- HELPER FUNCTIONS -------------------
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
    socket.write(`${protocol} ${HTTP_CODE.OK} ${CRLF.repeat(2)}`);
  } else if (apiAction === "echo") {
    const contentToSend = path.substring("/echo/".length);
    const contentLength = contentToSend.length;

    const response = new ResponseBuilder()
      .statusLine(protocol, HTTP_CODE.OK)
      .headers("text/plain", contentLength)
      .content(contentToSend)
      .createResponse();
    socket.write(response);
  } else if (apiAction === "user-agent") {
    const userAgentHeader = headers.find((header) =>
      header.startsWith("User-Agent: "),
    );
    const parsedUserAgent = userAgentHeader.split(" ")[1];
    const contentLength = parsedUserAgent.length;

    const response = new ResponseBuilder()
      .statusLine(protocol, HTTP_CODE.OK)
      .headers("text/plain", contentLength)
      .content(parsedUserAgent)
      .createResponse();
    socket.write(response);
  } else if (apiAction === "files") {
    const filename = path.substring("/files/".length);
    fs.readFile(`${directory}/${filename}`, (err, filedata) => {
      if (err) {
        const response = new ResponseBuilder()
          .notFound(protocol)
          .createResponse();
        socket.write(response);
      }

      const content = filedata.toString();
      const contentLength = content.length;
      console.log("content " + content);

      const response = new ResponseBuilder()
        .statusLine(protocol, HTTP_CODE.OK)
        .headers("application/octet-stream", contentLength)
        .content(content)
        .createResponse();
      socket.write(response);
    });
  } else {
    // socket.write(`${protocol} ${HTTP_CODE.NOT_FOUND} ${CRLF.repeat(2)}`);
    const response = new ResponseBuilder().notFound(protocol).createResponse();
    socket.write(response);
  }
}

class ResponseBuilder {
  constructor() {
    this.response = "";
  }

  createResponse() {
    console.debug("Response: \n" + this.response);
    return this.response;
  }

  statusLine(protocol, statusCode) {
    this.response += `${protocol} ${statusCode}${CRLF}`;
    return this;
  }

  headers(contentType, contentLength) {
    this.response +=
      `Content-Type: ${contentType}${CRLF}` +
      `Content-Length: ${contentLength}${CRLF.repeat(2)}`;
    return this;
  }

  content(content) {
    this.response += `${content}${CRLF}`;
    return this;
  }

  notFound(protocol) {
    this.response += `${protocol} ${HTTP_CODE.NOT_FOUND}${CRLF}${CRLF}`;
    return this;
  }
}
