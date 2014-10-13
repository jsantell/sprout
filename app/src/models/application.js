var config = require("../config");
var Model = require("./model");

module.exports = Model.extend({
  idAttribute: "ApplicationName",
  // Use `urlRoot` so that we can upload new tracks
  // separately from a collection
  urlRoot: config.apiURL + "applications",
  initialize: function () {},
});
