const net = require("net");
const fs = require("fs");
const dirFlag = process.argv.indexOf("--directory");
const dir =
  dirFlag > 1 && process.argv[process.argv.indexOf("--directory") + 1];

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    let path = data.toString().split(" ");
    let agent = data.toString().split("\r\n")[2];

    if (path[1] === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path[1].startsWith("/echo/")) {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${
          path[1].slice(6).length
        }\r\n\r\n${path[1].slice(6)}`,
      );
    } else if (path[1] === "/user-agent") {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${
          agent.slice(12).length
        }\r\n\r\n${agent.slice(12)}`,
      );
    } else if (path[1].startsWith("/files/")) {
      let fileName = path[1].slice(7);
      let filePath = `${dir}${fileName}`;

      try {
        if (fs.existsSync(filePath)) {
          let data = fs.readFileSync(filePath, "utf-8");

          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`,
          );
        }
      } catch (err) {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });

  socket.on("close", () => {
    socket.end();
    // server.close();
  });
});

server.listen(4221, "localhost");
// // You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");
//
// // -------------------- ARGS  -------------------
// const args = process.argv.slice(2); // trim first two elements (node, app/main.js)
// let directory;
//
// if (args.length > 0) {
//   if (args[0] === "--directory") {
//     directory = args[1];
//   }
// }
//
// // -------------------- SERVER  -------------------
// const CRLF = "\r\n";
// const HTTP_CODE = {
//   OK: "200 OK",
//   NOT_FOUND: "404 Not Found",
// };
// const HTTP_VERBS = {
//   GET: "GET",
// };
//
// const server = net.createServer((socket) => {
//   socket.on("close", () => {
//     socket.end();
//     server.close();
//   });
//
//   socket.on("data", (data) => {
//     const { headers, method, path, protocol } = parseHttpRequest(data);
//
//     switch (method) {
//       case HTTP_VERBS.GET:
//         processGetHttpRequest(socket, headers, path, protocol);
//         break;
//       default:
//         break;
//     }
//     socket.end();
//   });
// });
//
// server.listen(4221, "localhost");
//
// // -------------------- HELPER FUNCTIONS -------------------
// function parseHttpRequest(data) {
//   const decodedToString = data.toString();
//   const [startLine, ...headers] = decodedToString.split("\r\n");
//   const [method, path, protocol] = startLine.split(" ");
//
//   return { headers, method, path, protocol };
// }
//
// function processGetHttpRequest(socket, headers, path, protocol) {
//   const urlParams = path.substring(1).split("/");
//   const apiAction = urlParams[0];
//
//   if (path === "/") {
//     socket.write(`${protocol} ${HTTP_CODE.OK} ${CRLF.repeat(2)}`);
//   } else if (apiAction === "echo") {
//     const contentToSend = path.substring("/echo/".length);
//     const contentLength = contentToSend.length;
//
//     const response = new ResponseBuilder()
//       .statusLine(protocol, HTTP_CODE.OK)
//       .headers("text/plain", contentLength)
//       .content(contentToSend)
//       .createResponse();
//     socket.write(response);
//   } else if (apiAction === "user-agent") {
//     const userAgentHeader = headers.find((header) =>
//       header.startsWith("User-Agent: "),
//     );
//     const parsedUserAgent = userAgentHeader.split(" ")[1];
//     const contentLength = parsedUserAgent.length;
//
//     const response = new ResponseBuilder()
//       .statusLine(protocol, HTTP_CODE.OK)
//       .headers("text/plain", contentLength)
//       .content(parsedUserAgent)
//       .createResponse();
//     socket.write(response);
//   } else if (apiAction === "files") {
//     const filename = path.substring("/files/".length);
//     const absPath = `${directory}${filename}`;
//
//     if (fs.existsSync(absPath)) {
//       const content = fs.readFileSync(absPath);
//       const contentLength = content.length;
//
//       const response = new ResponseBuilder()
//         .statusLine(protocol, HTTP_CODE.OK)
//         .headers("application/octet-stream", contentLength)
//         .content(content)
//         .createResponse();
//       socket.write(response);
//     } else {
//       const response = new ResponseBuilder()
//         .notFound(protocol)
//         .createResponse();
//       socket.write(response);
//     }
//   } else {
//     const response = new ResponseBuilder().notFound(protocol).createResponse();
//     socket.write(response);
//   }
//   socket.end();
// }
//
// class ResponseBuilder {
//   constructor() {
//     this.response = "";
//   }
//
//   createResponse() {
//     console.debug("Response: \n" + this.response);
//     return this.response;
//   }
//
//   statusLine(protocol, statusCode) {
//     this.response += `${protocol} ${statusCode}${CRLF}`;
//     return this;
//   }
//
//   headers(contentType, contentLength) {
//     this.response +=
//       `Content-Type: ${contentType}${CRLF}` +
//       `Content-Length: ${contentLength}${CRLF.repeat(2)}`;
//     return this;
//   }
//
//   content(content) {
//     this.response += `${content}${CRLF}`;
//     return this;
//   }
//
//   notFound(protocol) {
//     this.response += `${protocol} ${HTTP_CODE.NOT_FOUND}${CRLF}${CRLF}`;
//     return this;
//   }
// }
