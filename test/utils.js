var _ = require("underscore");
var when = require("when");
var testConfig = require("./config.json");
var envConfig = { "SolutionStackName": "64bit Amazon Linux 2014.09 v1.0.8 running Node.js" };

var apiApp = _.findWhere(testConfig.Applications, { ApplicationName: "api-service" });
var clientApp = _.findWhere(testConfig.Applications, { ApplicationName: "client" });

function makeEnvConfig (appName, envName) {
  var app = _.findWhere(testConfig.Applications, { ApplicationName: appName });
  if (!app) {
    return envConfig;
  }
  var env = _.findWhere(app.Environments, { EnvironmentName: envName });
  return env || envConfig;
}

function seedAWS (jackie) {
  var apps;
  return when.all([
    jackie.createApplication("api-service", { Description: apiApp.Description }),
    jackie.createApplication("sandbox", { Description: "developer's sandbox" }),
    jackie.createApplication("client", { Description: clientApp.Description })
  ]).then(function (_apps) {
    apps = _apps;

    return when.all([
      apps[0].createVersion({ VersionLabel: "1.0.0" }),
      apps[0].createVersion({ VersionLabel: "1.2.0" }),
      apps[0].createVersion({ VersionLabel: "1.3.0" }),
      apps[0].createVersion({ VersionLabel: "2.0.0" }),
      apps[1].createVersion({ VersionLabel: "0.0.0" }),
      apps[2].createVersion({ VersionLabel: "stable" }),
      apps[2].createVersion({ VersionLabel: "latest" })
    ]).then(function () {
      return apps; 
    });
  }).then(function (apps) {;
    return when.all([
      apps[0].createEnvironment("api-service-dev",
        _.extend(makeEnvConfig("api-service", "api-service-dev"), { VersionLabel: "2.0.0" })),
      apps[0].createEnvironment("api-service-prod",
        _.extend(makeEnvConfig("api-service", "api-service-prod"), { VersionLabel: "1.3.0" })),
      apps[1].createEnvironment("test",
        _.extend(makeEnvConfig("sandbox", "test"), { VersionLabel: "0.0.0" })),
      apps[2].createEnvironment("client-dev",
        _.extend(makeEnvConfig("client", "client-dev"), { VersionLabel: "latest" })),
      apps[2].createEnvironment("client-prod",
        _.extend(makeEnvConfig("client", "client-prod"), { VersionLabel: "stable" })),
    ]);
  }).then(function (){});
}
exports.seedAWS = seedAWS;
