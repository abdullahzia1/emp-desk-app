const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// We need to use dynamic import in an async function
async function createWindow() {
  // Import electron-store dynamically
  const { default: Store } = await import("electron-store");

  // Create an instance of electron-store
  const store = new Store();

  // Create the window
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Link to the preload script
      nodeIntegration: false, // Disable nodeIntegration for security
      contextIsolation: true, // Enable context isolation for security
    },
  });

  // Load React app
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:3000"); // In dev mode, load React app from localhost
  } else {
    // In production, load the built React files
    win.loadURL("http://localhost:3000");
    // win.loadFile(path.join(__dirname, "build", "index.html"));
  }

  // When the window is closed
  win.on("closed", () => {
    win = null;
  });
}

// Handle app readiness
app.whenReady().then(() => {
  createWindow();

  // On macOS, create a window when the app is reactivated
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed (except macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers for user data and token storage
ipcMain.handle("get-auth-data", () => {
  // Fetch stored user data and token
  const user = store.get("user");
  const token = store.get("token");
  return { user, token };
});

ipcMain.handle("store-auth-data", (event, { user, token }) => {
  // Store user data and token securely
  store.set("user", user);
  store.set("token", token);
  return { success: true };
});

ipcMain.handle("clear-auth-data", () => {
  // Clear the stored data in electron-store
  store.clear();
  return { success: true };
});
