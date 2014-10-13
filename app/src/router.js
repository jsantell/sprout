var Backbone = require('backbone');
var defer = require('when').defer;
var Dashboard = require("./dashboard/dashboard");
var Router = Backbone.Router.extend({

  routes: {
    '': 'index'
  },

  index: function () {
    var dashboard = new Dashboard();
    this.setView(dashboard);
  },

  clearView: function () {
    if (this.view && this.view.destroy) {
      this.view.destroy();
    }
  },

  setView: function (view) {
    // Don't do anything if new view is the same as current view
    if (this.view === view)
      return;
    this.clearView();
    $('#main').html(view.render().el);
    this.view = view;
  }

});

module.exports = Router;
