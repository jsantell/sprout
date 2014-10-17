var _ = require("underscore");
var when = require("when");
var Task = require("co-task");
var normalizeConfig = require("../lib/config-helpers").normalizeConfig;
var testConfig = normalizeConfig(require("./config.json"));
var DEFAULT_ENV_CONFIG = { "SolutionStackName": "64bit Amazon Linux 2014.09 v1.0.8 running Node.js" };

var apiApp = _.findWhere(testConfig.Applications, { ApplicationName: "api-service" });
var clientApp = _.findWhere(testConfig.Applications, { ApplicationName: "client" });

// Helper so Mocha knows that the test is async
function asyncTest (fn) {
  return function (done) {
    var ctx = this;
    Task.async(fn).call(ctx).then(done, done);
  };
}
exports.asyncTest = asyncTest;

function makeEnvConfig (appName, envName, label) {
  var app = _.findWhere(testConfig.Applications, { ApplicationName: appName });
  var env;
  if (app) {
    env = _.findWhere(app.Environments, { EnvironmentName: envName });
  }
  
  if (!env) {
    env =  _.extend({}, DEFAULT_ENV_CONFIG, { EnvironmentName: envName });
  }
  
  return  _.extend({}, env, { ApplicationName: appName, VersionLabel: label });
}

var seedAWS = Task.async(function *(eb) {
  var apps = (yield when.all([
    eb.createApplication({ ApplicationName: "api-service", Description: apiApp.Description }),
    eb.createApplication({ ApplicationName: "sandbox", Description: "developer's sandbox" }),
    eb.createApplication({ ApplicationName: "client", Description: clientApp.Description })
  ])).map(function (app) { return app.Application });
  

  yield when.all([
    eb.createApplicationVersion({ ApplicationName: apps[0].ApplicationName, VersionLabel: "1.0.0" }),
    eb.createApplicationVersion({ ApplicationName: apps[0].ApplicationName, VersionLabel: "1.2.0" }),
    eb.createApplicationVersion({ ApplicationName: apps[0].ApplicationName, VersionLabel: "1.3.0" }),
    eb.createApplicationVersion({ ApplicationName: apps[0].ApplicationName, VersionLabel: "2.0.0" }),
    eb.createApplicationVersion({ ApplicationName: apps[1].ApplicationName, VersionLabel: "0.0.0" }),
    eb.createApplicationVersion({ ApplicationName: apps[2].ApplicationName, VersionLabel: "latest" }),
    eb.createApplicationVersion({ ApplicationName: apps[2].ApplicationName, VersionLabel: "stable" }),
  ]);

  yield when.all([
    eb.createEnvironment(makeEnvConfig("api-service", "api-service-dev", "2.0.0")),
    eb.createEnvironment(makeEnvConfig("api-service", "api-service-prod", "1.3.0")),
    eb.createEnvironment(makeEnvConfig("sandbox", "test", "0.0.0")),
    eb.createEnvironment(makeEnvConfig("client", "client-dev", "latest")),
    eb.createEnvironment(makeEnvConfig("client", "client-prod", "stable"))
  ]);
});

exports.seedAWS = seedAWS;
