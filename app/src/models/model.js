var Backbone = require("backbone");
var when = require("when");
var BackbonePromised = require("backbone-promised");

var BaseModel = Backbone.Model
  // Mixin promisifyable save, fetch, destroy
  .extend(BackbonePromised(Backbone.Model.prototype, when.promise));

module.exports = BaseModel;
