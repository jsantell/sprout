var _ = require("underscore");
var express = require("express");
var Jackie = require("jackie");
var config = Object.freeze(require("./config.json"));
var isTest = process.env.NODE_ENV === "test";

var app = module.exports = express();
app.jackie = new Jackie(_.extend({}, config.AWSCredentials, { mock: isTest }));
app.manifest = config.applications || [];

var routes = require("./router")(app);
