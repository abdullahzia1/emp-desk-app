const http = require("http");
const { handleMouseTracking } = require("./mouse-tracker");
const { CLIENT_PORT, API_ROUTES } = require("./constants");

let trackingId = null;
let shiftStatus = false;
let tracking = true;

function startApiServer() {
  const server = http.createServer(async (req, res) => {
    req.res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = body ? JSON.parse(body) : {};

      if (req.method === "POST" && req.url === API_ROUTES.SET_TRACKING_ID) {
        if (data.trackingId) {
          trackingId = data.trackingId;
          shiftStatus = data.shiftStatus;
          handleMouseTracking(trackingId, shiftStatus, () => tracking);
          res
            .writeHead(200)
            .end(JSON.stringify({ message: "Tracking started" }));
        } else {
          res
            .writeHead(400)
            .end(JSON.stringify({ message: "Missing trackingId" }));
        }
      } else if (req.method === "POST" && req.url === API_ROUTES.END_WORK) {
        tracking = false;
        trackingId = null;
        res.writeHead(200).end(JSON.stringify({ message: "Stopped tracking" }));
      } else {
        res.writeHead(404).end(JSON.stringify({ message: "Not Found" }));
      }
    });
  });

  server.listen(CLIENT_PORT, () => {
    console.log(`API server running on port ${CLIENT_PORT}`);
  });
}

module.exports = { startApiServer };
