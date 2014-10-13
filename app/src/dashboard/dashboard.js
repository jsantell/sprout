var _ = require("underscore");
var View = require("../views/view");
var Applications = require("../models/applications");
var ApplicationView = require("../applications/application");

module.exports = View.extend({
  name: "dashboard",
  className: "dashboard",
  template: require("./dashboard.hbs"),

  initialize: function (options) {
    var view = this;
    options = options || {};
    this.models = options.applications || new Applications();
    this.appViews = [];
    this.models.fetch()
      .then(this.createAppViews.bind(this))
      .then(this.render.bind(this));
  },

  getRenderData: function () {
    return { Applications: this.models.toJSON() };
  },

  afterRender: function () {
    var view = this;
    this.appViews.forEach(function (appView) {
      view.$(".applications").append(appView.el); 
    });
  },

  createAppViews: function () {
    var view = this;
    this.models.forEach(function (app) {
      if (!view.viewForApp(app)) {
        view.appViews.push(new ApplicationView({ model: app }));
      }
    });
  },

  viewForApp: function (app) {
    return _.findWhere(this.appViews, { appName: app.ApplicationName });
  }
});
