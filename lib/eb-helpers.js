var _ = require("underscore");
var Task = require("co-task");

function clone (x) {
  return JSON.parse(JSON.stringify(x));
}

function remove (array, el) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === el) {
      array.splice(i, 1);
      return;
    }
  }
}

var merge = exports.merge = function (apps, envs) {
  envs.forEach(function (env) {
    var app = Array.isArray(apps) ? _.findWhere(apps, { ApplicationName: env.ApplicationName }) : apps;
    app.Environments = app.Environments || [];
    app.Environments.push(env);
  });
  return apps;
};

var getApplications = exports.getApplications = Task.async(function *(eb, config) {
  var awsApps = (yield eb.describeApplications()).Applications;
  var defApps = clone(config.Applications);
  var allApps = [];
  var definedApp;

  awsApps.forEach(function (app) {
    // Tag all applications from AWS
    app.aws = true;

    // Tag the apps that are also defined in config
    if (definedApp = _.findWhere(defApps, { ApplicationName: app.ApplicationName })) {
      app.defined = true;

      // Remove definition for AWS application
      // so we can get the difference later
      remove(defApps, definedApp);
    } else {
      app.defined = false;
    }

    allApps.push(app);
  });

  // All remaining application definitions are not on AWS
  defApps.forEach(function (app) {
    app.aws = false;
    app.defined = true;
    allApps.push(app);

    // Remove environments because if we want to add that,
    // we can call `merge`, so we don't have Environments from the config (not formatted)
    // in an application.
    app.Environments = undefined;
  });

  return allApps;
});

var getApplication = exports.getApplication = Task.async(function *(eb, config, appName) {
  var data = yield eb.describeApplications({ ApplicationNames: [appName] });
  var definedApp = _.findWhere(config.Applications, { ApplicationName: appName });
  var app;

  // Application exists on AWS
  if (data.Applications[0]) {
    return _.extend(data.Applications[0], { aws: true, defined: !!definedApp });
  }

  // Application does not exist on AWS but is defined
  if (definedApp) {
    definedApp = clone(definedApp);
    definedApp.Environments = undefined;
    return _.extend(definedApp, { aws: false, defined: true });
  }

  // This application is nowhere to be found.
  return null;
});

var getEnvironments = exports.getEnvironments = Task.async(function *(eb, config, appName) {
  // Optionally filterable by `appName`
  var params = appName ? { ApplicationName: appName } : {};
  var awsEnvs = (yield eb.describeEnvironments(params)).Environments;
  var defEnvs = clone(config.Applications.reduce(function (envs, app) {
    // Also tag the environment with an ApplicationName, for parity
    // with environments from AWS
    if (!appName || app.ApplicationName === appName) {
      envs = envs.concat(app.Environments);
    }
    return envs;
  }, []));

  var allEnvs = [];
  var definedEnv;

  awsEnvs.forEach(function (env) {
    // Tag all environments from AWS
    env.aws = true;

    // Tag the envs that are also defined in config
    if (definedEnv = _.findWhere(defEnvs, { EnvironmentName: env.EnvironmentName })) {
      env.defined = true;

      // Remove definition for AWS application
      // so we can get the difference later
      remove(defEnvs, definedEnv);
    } else {
      env.defined = false;
    }

    allEnvs.push(env);
  });

  // All remaining application definitions are not on AWS
  defEnvs.forEach(function (env) {
    env.aws = false;
    env.defined = true;
    allEnvs.push(env);
  });

  return allEnvs;
});

var getEnvironment = exports.getEnvironment = Task.async(function *(eb, config, appName, envName) {
  var data = yield eb.describeEnvironments({ EnvironmentNames: [envName] });
  var definedApp = _.findWhere(config.Applications, { ApplicationName: appName });
  var definedEnv;
  var app;

  if (definedApp) {
    definedEnv = _.findWhere(definedApp.Environments, { EnvironmentName: envName });
    if (definedEnv) {
      definedEnv = clone(definedEnv);
    }
  }

  // Application exists on AWS
  if (data.Environments[0]) {
    return _.extend(data.Environments[0], { aws: true, defined: !!definedEnv });
  }

  // Application does not exist on AWS but is defined
  if (definedEnv) {
    return _.extend(definedEnv, { aws: false, defined: true });
  }

  // This application is nowhere to be found.
  return null;
});
