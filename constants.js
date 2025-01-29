const CLIENT_PORT = 4000;
const API_SERVER_HOST = "localhost";
const API_SERVER_PORT = 5000;

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const MONITOR_INTERVAL = 30 * 1000; // 30 seconds

const API_ROUTES = {
  SET_TRACKING_ID: "/api/set-tracking-id",
  END_WORK: "/api/end-work",
};

module.exports = {
  CLIENT_PORT,
  API_SERVER_HOST,
  API_SERVER_PORT,
  IDLE_TIMEOUT,
  MONITOR_INTERVAL,
  API_ROUTES,
};
