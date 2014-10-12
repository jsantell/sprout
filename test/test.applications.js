var _ = require("underscore");
var expect = require("chai").expect;
var Jackie = require("jackie");
var request = require("supertest");
var sprout = require("../");
var utils = require("./utils");

describe("API Applications", function () {
  beforeEach(function (done) {
    sprout.config = require("./config.json");
    sprout.jackie = new Jackie({ mock: true });
    utils.seedAWS(sprout.jackie).then(done);
  });

  describe("/api/applications/", function () {
    it("returns all available applications", function (done) {
      request(sprout)
        .get("/api/applications")
        .expect(200)
        .end(function (err, res) {
          var apps = res.body;
          expect(apps.length).to.be.equal(4);
          expect(_.findWhere(apps, { ApplicationName: "api-service" })).to.be.ok;
          expect(_.findWhere(apps, { ApplicationName: "sandbox" })).to.be.ok;
          expect(_.findWhere(apps, { ApplicationName: "client" })).to.be.ok;
          expect(_.findWhere(apps, { ApplicationName: "legacyapp" })).to.be.ok;
          done();
        });
    });
    it("tags applications as defined when corresponding manifest exists", function (done) {
      request(sprout)
        .get("/api/applications")
        .expect(200)
        .end(function (err, res) {
          var apps = res.body;
          expect(_.findWhere(apps, { ApplicationName: "api-service" }).defined).to.be.ok;
          expect(_.findWhere(apps, { ApplicationName: "client" }).defined).to.be.ok;
          expect(_.findWhere(apps, { ApplicationName: "sandbox" }).defined).to.be.not.ok;
          expect(_.findWhere(apps, { ApplicationName: "legacyapp" }).defined).to.be.ok;
          done();
        });
    });
    it("tags applications as `aws` when found on AWS", function (done) {
      request(sprout)
        .get("/api/applications")
        .expect(200)
        .end(function (err, res) {
          var apps = res.body;
          expect(_.findWhere(apps, { ApplicationName: "api-service" }).aws).to.be.ok;
          expect(_.findWhere(apps, { ApplicationName: "client" }).aws).to.be.ok;
          expect(_.findWhere(apps, { ApplicationName: "sandbox" }).aws).to.be.ok;
          expect(_.findWhere(apps, { ApplicationName: "legacyapp" }).aws).to.be.not.ok;
          done();
        });
    });
    it("does not fetch environments of applications", function (done) {
      request(sprout)
        .get("/api/applications")
        .expect(200)
        .end(function (err, res) {
          var apps = res.body;
          var app = _.findWhere(apps, { ApplicationName: "api-service" });
          expect(app.Environments).to.be.equal(undefined);
          done();
        });
    });
  });

  describe("/api/applications/:name", function () {
    it("returns application data for an app defined and on aws", function (done) {
      request(sprout)
        .get("/api/applications/api-service")
        .expect(200)
        .end(function (err, res) {
          var app = res.body;
          expect(app.ApplicationName).to.be.equal("api-service");
          expect(app.Description).to.be.equal("My API Service");
          expect(new Date(app.DateCreated)).to.be.a("date");
          expect(app.aws).to.be.equal(true);
          expect(app.defined).to.be.equal(true);
          done();
        });
    });
    it("returns application data for an app defined and not aws", function (done) {
      request(sprout)
        .get("/api/applications/legacyapp")
        .expect(200)
        .end(function (err, res) {
          var app = res.body;
          expect(app.ApplicationName).to.be.equal("legacyapp");
          expect(app.DateCreated).to.be.equal(undefined);
          expect(app.aws).to.be.equal(false);
          expect(app.defined).to.be.equal(true);
          done();
        });
    });
    it("returns application data for an app undefined but on aws", function (done) {
      request(sprout)
        .get("/api/applications/sandbox")
        .expect(200)
        .end(function (err, res) {
          var app = res.body;
          expect(app.ApplicationName).to.be.equal("sandbox");
          expect(new Date(app.DateCreated)).to.be.a("date");
          expect(app.aws).to.be.equal(true);
          expect(app.defined).to.be.equal(false);
          done();
        });
    });
    
    it("returns environments on AWS that are defined", function (done) {
      request(sprout)
        .get("/api/applications/api-service")
        .expect(200)
        .end(function (err, res) {
          var envs = res.body.Environments;
          expect(envs.length).to.be.equal(3);
          var dev = _.findWhere(envs, { EnvironmentName: "api-service-dev" });
          var prod = _.findWhere(envs, { EnvironmentName: "api-service-prod" });
          expect(new Date(dev.DateUpdated)).to.be.a("date");
          expect(new Date(prod.DateUpdated)).to.be.a("date");
          expect(dev.Description).to.be.equal("Dev environment for API Service");
          expect(dev.aws).to.be.equal(true);
          expect(dev.defined).to.be.equal(true);
          expect(prod.aws).to.be.equal(true);
          expect(prod.defined).to.be.equal(true);
          done();
        });
    });
    it("returns environments on AWS that are not defined", function (done) {
      request(sprout)
        .get("/api/applications/client")
        .expect(200)
        .end(function (err, res) {
          var envs = res.body.Environments;
          expect(envs.length).to.be.equal(2);
          var dev = _.findWhere(envs, { EnvironmentName: "client-dev" });
          var prod = _.findWhere(envs, { EnvironmentName: "client-prod" });
          expect(new Date(dev.DateUpdated)).to.be.a("date");
          expect(new Date(prod.DateUpdated)).to.be.a("date");
          expect(dev.aws).to.be.equal(true);
          expect(dev.defined).to.be.equal(true);
          expect(prod.aws).to.be.equal(true);
          expect(prod.defined).to.be.equal(false);
          done();
        });
    }); 
    it("returns environments that are defined but not on AWS", function (done) {
      request(sprout)
        .get("/api/applications/api-service")
        .expect(200)
        .end(function (err, res) {
          var envs = res.body.Environments;
          expect(envs.length).to.be.equal(3);
          var env = _.findWhere(envs, { EnvironmentName: "api-service-unused" });
          expect(env.DateUpdated).to.be.equal(undefined);
          expect(env.aws).to.be.equal(false);
          expect(env.defined).to.be.equal(true);
          done();
        });
    }); 
  });
});
