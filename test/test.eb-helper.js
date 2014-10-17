var _ = require("underscore");
var expect = require("chai").expect;
var utils = require("./utils");
var asyncTest = utils.asyncTest;
var EB = require("../lib/eb");
var helper = require("../lib/eb-helpers");
var async = require("co-task").async;

describe("lib/eb-helper", function () {
  beforeEach(function (done) {
    this.config = require("./config.json");
    this.eb = new EB({ mock: true });
    utils.seedAWS(this.eb).then(done);
  });

  describe("getApplications", function () {
    it("returns all available applications with no dupes", asyncTest(function *() {
      var apps = yield helper.getApplications(this.eb, this.config);
      expect(apps.length).to.be.equal(4);
      expect(_.findWhere(apps, { ApplicationName: "api-service" })).to.be.ok;
      expect(_.findWhere(apps, { ApplicationName: "sandbox" })).to.be.ok;
      expect(_.findWhere(apps, { ApplicationName: "legacyapp" })).to.be.ok;
      expect(_.findWhere(apps, { ApplicationName: "client" })).to.be.ok;
    }));
  
    it("tags `aws` and `defined` based on AWS/definition status", asyncTest(function *() {
      var apps = yield helper.getApplications(this.eb, this.config);
      expect(_.findWhere(apps, { ApplicationName: "api-service" }).aws).to.be.equal(true);
      expect(_.findWhere(apps, { ApplicationName: "api-service" }).defined).to.be.equal(true);
      expect(_.findWhere(apps, { ApplicationName: "sandbox" }).aws).to.be.equal(true);
      expect(_.findWhere(apps, { ApplicationName: "sandbox" }).defined).to.be.equal(false);
      expect(_.findWhere(apps, { ApplicationName: "legacyapp" }).aws).to.be.equal(false);
      expect(_.findWhere(apps, { ApplicationName: "legacyapp" }).defined).to.be.equal(true);
      expect(_.findWhere(apps, { ApplicationName: "client" }).aws).to.be.equal(true);
      expect(_.findWhere(apps, { ApplicationName: "client" }).defined).to.be.equal(true);
    }));
    
    it("does not contain environments", asyncTest(function *() {
      var apps = yield helper.getApplications(this.eb, this.config);
      expect(_.findWhere(apps, { ApplicationName: "api-service" }).Environments).to.not.be.ok;
      expect(_.findWhere(apps, { ApplicationName: "sandbox" }).Environments).to.not.be.ok;
      expect(_.findWhere(apps, { ApplicationName: "legacyapp" }).Environments).to.not.be.ok;
      expect(_.findWhere(apps, { ApplicationName: "client" }).Environments).to.not.be.ok;
    }));
    
    it("AWS apps have all AWS information", asyncTest(function *() {
      var apps = yield helper.getApplications(this.eb, this.config);
      expect(_.findWhere(apps, { ApplicationName: "api-service" }).Description).to.be.equal("My API Service");
    }));
    
    it("defined apps have definintion information", asyncTest(function *() {
      var apps = yield helper.getApplications(this.eb, this.config);
      expect(_.findWhere(apps, { ApplicationName: "legacyapp" }).Description).to.be.equal("Some Old Ass Stuff");
    }));
  });

  describe("getEnvironments", function () {
    it("returns all available environments with no dupes", asyncTest(function *() {
      var envs = yield helper.getEnvironments(this.eb, this.config);
      expect(envs.length).to.be.equal(7);
      expect(_.findWhere(envs, { EnvironmentName: "api-service-dev" })).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "api-service-prod" })).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "api-service-unused" })).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "test" })).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "client-dev" })).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "client-prod" })).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "legacy-env" })).to.be.ok;
    }));
    
    it("tags `aws` and `defined` based on AWS/definition state", asyncTest(function *() {
      var envs = yield helper.getEnvironments(this.eb, this.config);
      expect(_.findWhere(envs, { EnvironmentName: "api-service-dev" }).aws).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "api-service-dev" }).defined).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "api-service-prod" }).aws).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "api-service-prod" }).defined).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "api-service-unused" }).aws).to.not.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "api-service-unused" }).defined).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "test" }).aws).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "test" }).defined).to.not.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "client-dev" }).aws).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "client-dev" }).defined).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "client-prod" }).aws).to.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "client-prod" }).defined).to.not.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "legacy-env" }).aws).to.not.be.ok;
      expect(_.findWhere(envs, { EnvironmentName: "legacy-env" }).defined).to.be.ok;
    }));

    it("AWS envs have all env information", asyncTest(function *() {
      var envs = yield helper.getEnvironments(this.eb, this.config);
      expect(_.findWhere(envs, { EnvironmentName: "api-service-dev" }).DateCreated).to.be.a("date");
    }));
    
    it("defined envs have definition information", asyncTest(function *() {
      var envs = yield helper.getEnvironments(this.eb, this.config);
      expect(_.findWhere(envs, { EnvironmentName: "legacy-env" }).Description).to.be.equal("Old environment");
    }));
  });

  describe("merge", function () {
    it("merges envs inside of applications", asyncTest(function *() {
      var envs = yield helper.getEnvironments(this.eb, this.config);
      var apps = yield helper.getApplications(this.eb, this.config);
      apps = helper.merge(apps, envs);
      expect(find(apps, "api-service", "api-service-dev")).to.be.ok; 
      expect(find(apps, "api-service", "api-service-prod")).to.be.ok; 
      expect(find(apps, "api-service", "api-service-unused")).to.be.ok; 
      expect(find(apps, "sandbox", "test")).to.be.ok; 
      expect(find(apps, "client", "client-dev")).to.be.ok; 
      expect(find(apps, "client", "client-prod")).to.be.ok; 
      expect(find(apps, "legacyapp", "legacy-env")).to.be.ok; 
    }));
  });

  describe("getApplication", function () {
    it("gets application on AWS that is defined", asyncTest(function *() {
      var app = yield helper.getApplication(this.eb, this.config, "api-service");
      expect(app.aws).to.be.ok;
      expect(app.defined).to.be.ok;
      expect(app.Environments).to.not.be.ok;
    }));
    
    it("gets application on AWS that is not defined", asyncTest(function *() {
      var app = yield helper.getApplication(this.eb, this.config, "sandbox");
      expect(app.aws).to.be.ok;
      expect(app.defined).to.be.not.ok;
    }));
    
    it("gets application only defined, not on AWS", asyncTest(function *() {
      var app = yield helper.getApplication(this.eb, this.config, "legacyapp");
      expect(app.aws).to.be.not.ok;
      expect(app.defined).to.be.ok;
    }));
  });
  
  describe("getEnvironment", function () {
    it("gets environment on AWS that is defined", asyncTest(function *() {
      var env = yield helper.getEnvironment(this.eb, this.config, "api-service", "api-service-dev");
      expect(env.aws).to.be.ok;
      expect(env.defined).to.be.ok;
    }));

    it("gets environment on AWS that is not defined", asyncTest(function *() {
      var env = yield helper.getEnvironment(this.eb, this.config, "sandbox", "test");
      expect(env.aws).to.be.ok;
      expect(env.defined).to.not.be.ok;
    }));
    
    it("gets environment not on AWS that is defined", asyncTest(function *() {
      var env = yield helper.getEnvironment(this.eb, this.config, "legacyapp", "legacy-env");
      expect(env.aws).to.be.not.ok;
      expect(env.defined).to.be.ok;
    }));
  });
});

function find (apps, appName, envName) {
  var app = _.findWhere(apps, { ApplicationName: appName });
  return _.findWhere(app.Environments, { EnvironmentName: envName });
}
