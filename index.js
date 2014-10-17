var express = require("express");
var logger = require("morgan");
var EB = require("./lib/eb");
var normalizeConfig = require("./lib/config-helpers").normalizeConfig;
var manifest = require("./package.json");
var env = process.env.NODE_ENV;
var isTest = env === "test";
var isDemo = env === "demo";
var sproutConfig = normalizeConfig((isTest || isDemo) ? require("./test/config.json") : require("./config.json"));
var ebConfig = (isTest || isDemo) ? ({ mock: true }) : sproutConfig.AWSCredentials;
var port = sproutConfig.port || 9999;

var app = module.exports = express();
app.config = sproutConfig;
app.eb = new EB(ebConfig);
app.manifest = sproutConfig.Applications;

app.use(express.static(__dirname + '/app/build'));
if (!isTest) {
  app.use(logger());
}

// For demo purposes, seed if environment is "demo",
// set up CORS
if (isDemo) {
  require("./test/utils").seedAWS(app.jackie);
  app.use(require("cors")());
}

// Add API
require("./router")(app);

console.log("Running Sprout " + manifest.version + " in '" + env + "' environment on port " + port);
app.listen(port);
