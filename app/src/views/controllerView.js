var View = require('./view');

module.exports = View.extend({
  setView: function (selector, view) {
    var controllerView = this;
    controllerView.$(selector).html(view.render().delegateEvents().$el);
  }
});
