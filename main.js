const { app, BrowserWindow } = require("electron");
const path = require("path");
const { mouse } = require("@nut-tree-fork/nut-js");
const http = require("http");

let mainWindow;
let lastActivityTime = Date.now();
const idleTimeout = 1 * 60 * 1000; // 5 minutes in milliseconds
let currentState = "active"; // Tracks current state, default is "active"
let trackingId = null; // Stores the trackingId
let shiftStatus = false;
let tracking = true;

app.on("ready", () => {
  startApiServer();
});
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    console.log("Dev");
    // mainWindow.loadURL("http://localhost:3000");
    mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
  } else {
    console.log("Prod");
    // mainWindow.loadURL("http://localhost:3000");
    mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
    // mainWindow.loadFile("./build/index.html");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Function to check for mouse activity
async function checkMouseActivity() {
  let mouseMoved = false;
  const monitorDuration = 10 * 1000; // Monitor for 10 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < monitorDuration) {
    const initialPos = await mouse.getPosition();
    await new Promise((resolve) => setTimeout(resolve, 500)); // Check every 500ms
    const currentPos = await mouse.getPosition();

    if (initialPos.x !== currentPos.x || initialPos.y !== currentPos.y) {
      mouseMoved = true;
      lastActivityTime = Date.now();
      break;
    }
  }

  return mouseMoved;
}

// Function to handle state changes
function updateState(newState) {
  if (currentState !== newState) {
    currentState = newState;

    if (newState === "active") {
      sendActiveRequest();
    } else if (newState === "idle") {
      sendIdleRequest();
    }
  }
}

// Function to track mouse activity
function startMouseTracking() {
  setInterval(async () => {
    if (!trackingId) return; // Skip tracking if no trackingId
    if (shiftStatus) return;
    if (!tracking) return;
    console.log("Starting Mouse Movements", trackingId);
    const mouseMoved = await checkMouseActivity();

    if (!mouseMoved && Date.now() - lastActivityTime >= idleTimeout) {
      updateState("idle");
    } else if (mouseMoved) {
      updateState("active");
    }
  }, 30 * 1000); // Check every 30 seconds
}

// Function to send "active" request
function sendActiveRequest() {
  console.log("Sending active request...");
  const data = JSON.stringify({ status: "active", trackingId });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/status",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    let response = "";
    res.on("data", (chunk) => {
      response += chunk;
    });
    res.on("end", () => {
      console.log("Active status sent successfully:", response);
    });
  });

  req.on("error", (error) => {
    console.error("Error sending active request:", error);
  });

  req.write(data);
  req.end();
}

// Function to send "idle" request
function sendIdleRequest() {
  console.log("Sending idle request...");
  const data = JSON.stringify({ status: "idle", trackingId });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/status",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    let response = "";
    res.on("data", (chunk) => {
      response += chunk;
    });
    res.on("end", () => {
      console.log("Idle status sent successfully:", response);
    });
  });

  req.on("error", (error) => {
    console.error("Error sending idle request:", error);
  });

  req.write(data);
  req.end();
}
function sendStopTracking() {
  console.log("Sending stop tracking request...");
  const data = JSON.stringify({ status: "stop", trackingId });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/employee/status",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    let response = "";
    res.on("data", (chunk) => {
      response += chunk;
    });
    res.on("end", () => {
      console.log("Idle status sent successfully:", response);
    });
  });

  req.on("error", (error) => {
    console.error("Error sending idle request:", error);
  });

  req.write(data);
  req.end();
}

// Start an HTTP server to receive the trackingId
function startApiServer() {
  const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Allowed headers

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      res.writeHead(204); // No Content
      res.end();
      return;
    }

    if (req.method === "POST" && req.url === "/api/set-tracking-id") {
      console.log("Active POST");
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        const data = JSON.parse(body);
        console.log(data);
        if (data.trackingId) {
          trackingId = data.trackingId;
          shiftStatus = data.shiftStatus;
          console.log(`Tracking started with ID: ${trackingId}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Tracking started" }));

          // Start mouse tracking when trackingId is received
          startMouseTracking();
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Missing trackingId" }));
        }
      });
    } else if (req.method === "POST" && req.url === "/api/logout") {
      tracking = false;
      trackingId = null;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Stopped Tracking" }));
      return;
    } else if (req.method === "POST" && req.url === "/api/end-work") {
      tracking = false;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Stopped Tracking" }));
      return;
    } else if (req.method === "POST" && req.url === "/api/start-break") {
      tracking = false;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Stopped Tracking" }));
      return;
    } else if (req.method === "POST" && req.url === "/api/end-break") {
      tracking = true;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Started Tracking" }));
      return;
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Not Found" }));
      return;
    }
  });

  server.listen(4000, () => {
    console.log("API server listening on port 4000");
  });
}

// Create and manage the Electron window
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
