var when = require("when");
var _ = require("underscore");
var async = require("co-task").async;
var helper = require("../lib/eb-helpers");

/**
 * Application description objects are from AWS tagged with
 * a `defined` property, depending on whether or not the application
 * has been defined in the build, as well as `aws` indicating
 * whether or not the application is on AWS.
 *
 * {Boolean} `defined`
 * {Boolean} `aws`
 */

/**
 * /api/applications
 *
 * Returns all applications on AWS, and tags defined applications
 * with `defined` boolean.
 */

exports.index = async(function *(req, res) {
  var config = res.app.config;
  var eb = res.app.eb;
  
  res.send(yield helper.getApplications(eb, config));
});

/**
 * /api/applications/:name
 *
 * Returns updated information on current application.
 */

exports.read = async(function *(req, res) {
  var appName = req.params.name;
  var eb = res.app.eb;
  var config = res.app.config;

  var app = helper.merge(
    yield helper.getApplication(eb, config, appName),
    yield helper.getEnvironments(eb, config, appName));
  res.send(app);
});

exports.environment = async(function *(req, res) {
  var appName = req.params.app;
  var envName = req.params.env;
  var eb = res.app.eb;
  var config = res.app.config;

  res.send((yield helper.getEnvironment(eb, config, appName, envName)));
});

exports.updateEnvironment = async(function *(req, res) {
  var appName = req.params.app;
  var envName = req.params.env;
  var eb = res.app.eb;
  var config = res.app.config;
  
});

exports.deploy = async(function *(req, res) {
  var jackie = res.app.jackie;
  var config = res.app.config;
  var appName = req.params.app;
  var envName = req.params.env;
  var version = req.params.version;

  var appConfiguration = _.findWhere(config.Applications, { ApplicationName: appName });
  var envConfiguration = _.findWhere((appConfiguration || {}).Environments || [], { EnvironmentName: envName });
  
  if (!envConfiguration || !appConfiguration) {
    res.status(400);
    res.send({ message: "Configuration not found for " + envName });
    return;
  }

  var deploymentConfiguration = _.extend({}, envConfiguration, { VersionLabel: version });
  var app;
  jackie.getApplication(appName).then(function (_app) {
    app = _app;
    // If no app, this wasn't created on AWS yet, so create it
    if (!_app) {
      return jackie.createApplication(appName, appConfiguration)
        .then(function (_app) {
          app = _app;
          app.createEnvironment(envName, deploymentConfiguration); 
        });
    } else {
      return app.getEnvironment(envName).then(function (env) {
        // If no environment, create one and use deployment configuration
        if (!env) {
          return app.createEnvironment(envName, deploymentConfiguration);
        }
        // Only update environment since we can't update config and version at the same time
        return env.update({ VersionLabel: version });
      });
    }
  }).then(function () {
    res.send({ message: appName + "'s " + envName + " updating with application version " + version }); 
  }, function (err) {
    res.status(500);
    res.send({ message: err });
  });
});
