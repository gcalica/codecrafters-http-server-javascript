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
    console.log(directory);
    const filename = path.substring("/files/".length);
    console.log(filename);
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error("Unable to scan directory: " + err);
        return;
      }

      files.forEach((file) => {
        if (file === filename) {
          const path = directory + file;
          console.log(path);
          fs.readFile(path, "utf8", (err, data) => {
            if (err) {
              console.error(err);
              return;
            }

            console.log(data);
            const contentLength = data.length;

            const response = new ResponseBuilder()
              .statusLine(protocol, HTTP_CODE.OK)
              .headers("application/octet-stream", contentLength)
              .content(data)
              .createResponse();
            console.log(response);
            socket.write(response);
            return;
          });
        }
      });

      socket.write(`${protocol} ${HTTP_CODE.NOT_FOUND} ${CRLF.repeat(2)}`);
    });
  } else {
    socket.write(`${protocol} ${HTTP_CODE.NOT_FOUND} ${CRLF.repeat(2)}`);
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
}
