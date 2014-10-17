/**
 * Takes a `config` object from a JSON definition most likely
 * and ensures that missing fields that are expected are atleast
 * defined, so we don't get errors later on assuming that Applications
 * and Environments are defined.
 *
 * @param {Object} config
 * @return {Object}
 */

function normalizeConfig (config) {
  config = config || {};
  config.Applications = config.Applications || [];
  config.Applications.forEach(function (app) {
    app.Environments = app.Environments || [];
    app.Environments.forEach(function (env) {
      env.ApplicationName = app.ApplicationName;
    });
  });
  return Object.freeze(config);
}
exports.normalizeConfig = normalizeConfig;

/**
 * Takes a `config` object and returns an application
 * by name.
 *
 * @param {Object} config
 * @param {String} appName
 * @return {Object|undefined}
 */

function getApplication (config, appName) {
  return _.findWhere(config.Applications, { ApplicationName: appName });
}
exports.getApplication = getApplication;

/**
 * Takes a `config` object and returns an environment
 * by name.
 *
 * @param {Object} config
 * @param {String} envName
 * @return {Object|undefined}
 */

function getEnvironment (config, envName) {
  var apps = config.Applications;
  var env;
  for (var i = 0; i < apps.length; i++) {
    if (env = _.findWhere(apps[i].Environments, { EnvironmentName: envName })) {
      return env; 
    }
  }
}
