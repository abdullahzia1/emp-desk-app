const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  // Exposing the `axios` functionality or other methods you need.
  postIdleTime: (idleTime) => ipcRenderer.send("update-idle-time", idleTime), // Example for idle time
});
