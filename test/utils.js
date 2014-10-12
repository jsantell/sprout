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
  return when.all([
    jackie.createApplication("api-service", { Description: apiApp.Description }),
    jackie.createApplication("sandbox", { Description: "developer's sandbox" }),
    jackie.createApplication("client", { Description: clientApp.Description })
  ]).then(function (apps) {
    return when.all([
      apps[0].createEnvironment("api-service-dev", makeEnvConfig("api-service", "api-service-dev")),
      apps[0].createEnvironment("api-service-prod", makeEnvConfig("api-service", "api-service-prod")),
      apps[1].createEnvironment("test", makeEnvConfig("sandbox", "test")),
      apps[2].createEnvironment("client-dev", makeEnvConfig("client", "client-dev")),
      apps[2].createEnvironment("client-prod", makeEnvConfig("client", "client-prod"))
    ]);
  }).then(function (){});
}
exports.seedAWS = seedAWS;
