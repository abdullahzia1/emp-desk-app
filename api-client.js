const http = require("http");
const { API_SERVER_HOST, API_SERVER_PORT } = require("./constants");

function sendStatusUpdate(status, trackingId) {
  const data = JSON.stringify({ status, trackingId });

  const options = {
    hostname: API_SERVER_HOST,
    port: API_SERVER_PORT,
    path: "/api/employee/status",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    let response = "";
    res.on("data", (chunk) => (response += chunk));
    res.on("end", () => {
      console.log(`${status} status sent:`, response);
    });
  });

  req.on("error", (err) => {
    console.error(`Error sending ${status} request:`, err.message);
  });

  req.write(data);
  req.end();
}
function callbackFunction() {}

module.exports = { sendStatusUpdate };
