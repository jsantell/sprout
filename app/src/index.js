var Backbone = require("backbone");

// Since jQuery isn"t up to date in npm..
window.$ = Backbone.$ = require("../vendor/scripts/jquery");

var Router = require("./router");
var config = require("./config");

var app = {};

// Fire up router
app.router = new Router();


Backbone.history.start({ root: config.root });

module.exports = app;
