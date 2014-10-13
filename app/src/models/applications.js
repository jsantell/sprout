var Collection = require("./collection");
var config = require("../config");

module.exports = Collection.extend({
  model: require("./application"),
  url: config.apiURL + "applications",
  initialize: function () {
  }
});
