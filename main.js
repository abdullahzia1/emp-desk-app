const { app, BrowserWindow } = require("electron");
const path = require("path");
const { startApiServer } = require("./api-server");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  try {
    if (process.env.NODE_ENV === "development") {
      // mainWindow.loadURL("http://localhost:3000");
      const startUrl = `file://${path.join(__dirname, "build", "index.html")}`;
      mainWindow.loadURL(startUrl);
      // mainWindow.loadFile(path.join(__dirname, "build", "index.html"));
    } else {
      // mainWindow.loadFile(path.join(__dirname, "build", "index.html"));

      const startUrl = `file://${path.join(__dirname, "build", "index.html")}`;
      mainWindow.loadURL(startUrl);
    }
  } catch (error) {
    console.log(error);
  }

  mainWindow.on("close", () => {
    // Clear the token from localStorage
    mainWindow.webContents.executeJavaScript(`
      localStorage.removeItem("shiftStatus");
      localStorage.removeItem("breakStatus");
      localStorage.removeItem("user");
      localStorage.removeItem("startingTime");
      localStorage.removeItem("authToken");
      localStorage.removeItem("dataToken");
    `);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  startApiServer();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // callbackFunction()
    app.quit();
  }
});
