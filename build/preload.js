// /public/preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Exposing specific APIs to the renderer process safely
contextBridge.exposeInMainWorld("electron", {
  // Function to call from renderer process (React) to Electron
  closeWindow: () => ipcRenderer.send("close-window"),
  // Add more functions here as needed
});
