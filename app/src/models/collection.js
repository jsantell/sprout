var Backbone = require("backbone");
var when = require("when");
var BackbonePromised = require("backbone-promised");

var BaseCollection = Backbone.Collection
  .extend(BackbonePromised(Backbone.Collection.prototype, when.promise));

module.exports = BaseCollection;
