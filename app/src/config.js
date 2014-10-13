var config = {
  apiURL: window.location.port === "8080" ? "http://localhost:4756/api/" : "/api/",
  root: "/"
};

module.exports = Object.freeze ? Object.freeze(config) : config;
