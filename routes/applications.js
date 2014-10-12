var when = require("when");
var _ = require("underscore");

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

exports.index = function (req, res) {
  var jackie = res.app.jackie;
  var config = res.app.config;

  jackie.getApplications().then(function (apps) {
    return formatApps(apps, config);
  }).then(function (apps) {
    res.send({ Applications: apps });
  });
};

/**
 * /api/applications/:name
 *
 * Returns updated information on current application.
 */

exports.read = function (req, res) {
  var appName = req.params.name;
  var jackie = res.app.jackie;
  var config = res.app.config;

  jackie.getApplication(appName).then(function (app) {
    if (app) {
      return formatAppFromAWS(app, config);
    }
    else {
      // This app wasn't found on AWS
      return formatAppFromManifest(_.findWhere(config.Applications, { ApplicationName: appName }));
    }
  }).then(res.send.bind(res));
};

exports.environments = function (req, res) {
  var appName = req.params.name;
  var jackie = res.app.jackie;
  var config = res.app.config;

  jackie.getApplication(appName).then(function (app) {
    // If app not found, could be a defined and not on AWS app,
    // either way, it either won't have environments, or we don't
    // display environments on apps that aren't on AWS
    if (!app) {
      return res.status(400).end();
    }

    return app.getEnvironments();
  }).then(function (envs) {
    return formatEnvs(appName, envs, config).then(function (envs) {
      return { Environments: envs };
    });
  }).then(res.send.bind(res));
};

/**
 * Format an app via an AWS request. Takes a Jackie.Application
 * and fetches info.
 */
function formatAppFromAWS (app, config) {
  return app.info({ cached: true }).then(function (data) {
    data.defined = !!_.findWhere(config.Applications, { ApplicationName: data.ApplicationName });
    data.aws = true;
    return data;
  });
}

function formatAppFromManifest (app) {
  return {
    ApplicationName: app.ApplicationName,
    Description: app.Description,
    defined: true,
    aws: false
  };
}

/**
 * Takes an array of Jackie.Application objects, fetches the info
 * and tags `defined` and `aws` properties. Includes applications defined in manifest
 * and that do not exist on AWS.
 *
 * @param {[Object]} apps
 * @param {Object} config
 * @return {Promise<[Object]>}
 */

function formatApps (apps, config) {
  return when.all(apps.map(function (app) {
    return formatAppFromAWS(app, config);
  })).then(function (apps) {
    config.Applications.forEach(function (app) {
      if (!_.findWhere(apps, { ApplicationName: app.ApplicationName })) {
        apps.push(formatAppFromManifest(app));
      }
    });
    return apps;
  });
}

function formatEnvFromAWS (env, config) {
  return env.info({ cached: true }).then(function (data) {
    var app = _.findWhere(config.Applications, { ApplicationName: data.ApplicationName });
    data.defined = !!_.findWhere(app.Environments || [], { EnvironmentName: data.EnvironmentName });
    data.aws = true;
    return data;
  });
}

function formatEnvFromManifest (env) {
  return {
    ApplicationName: env.ApplicationName,
    EnvironmentName: env.EnvironmentName,
    Description: env.Description,
    defined: true,
    aws: false
  };
}

function formatEnvs (appName, envs, config) {
  return when.all(envs.map(function (env) {
    return formatEnvFromAWS(env, config);
  })).then(function (envs) {
    // Add environments not on AWS
    var app = _.findWhere(config.Applications, { ApplicationName: appName });
    var manifestEnvs = app.Environments || [];
    manifestEnvs.forEach(function (env) {
      if (!_.findWhere(envs, { EnvironmentName: env.EnvironmentName })) {
        envs.push(formatEnvFromManifest(env));
      }
    });
    return envs;
  });
}
