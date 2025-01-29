const { mouse } = require("@nut-tree-fork/nut-js");
const { IDLE_TIMEOUT, MONITOR_INTERVAL } = require("./constants");
const { sendStatusUpdate } = require("./api-client");

let lastActivityTime = Date.now();
let currentState = "active";

async function checkMouseActivity() {
  const startPos = await mouse.getPosition();
  await new Promise((resolve) => setTimeout(resolve, 500));
  const endPos = await mouse.getPosition();

  if (startPos.x !== endPos.x || startPos.y !== endPos.y) {
    lastActivityTime = Date.now();
    return true;
  }

  return false;
}

function handleMouseTracking(trackingId, shiftStatus, isTracking) {
  setInterval(async () => {
    if (!trackingId || shiftStatus || !isTracking()) return;

    const mouseMoved = await checkMouseActivity();

    // Determine new state
    const newState =
      !mouseMoved && Date.now() - lastActivityTime >= IDLE_TIMEOUT
        ? "idle"
        : "active";

    // Only send an update if the state has changed
    if (newState !== currentState) {
      currentState = newState;
      sendStatusUpdate(newState, trackingId);
    }
  }, MONITOR_INTERVAL);
}

module.exports = { handleMouseTracking };
