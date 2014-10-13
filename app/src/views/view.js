var Backbone = require('backbone');
var _ = require('underscore');
var when = require('when');

module.exports = Backbone.View.extend({
  render: function () {
    this.beforeRender();
    
    // If `getRenderData` function exists, call it. Otherwise, look for
    // `this.model` and call `.toJSON()` on it. Otherwise, just return an empty
    // object.
    var data = this.getRenderData ? this.getRenderData() :
               this.model ? this.model.toJSON() : {};
    this.$el.html(this.template(data));

    this.afterRender();
    return this;
  },

  // Fetch model or collection (models) via promise, or return a dummy promise if no model specified
  fetch: function () {
    if (this.model)
      return this.model.fetch();
    else if (this.models)
      return this.models.fetch();
    else
      return when.resolve();
  },

  destroy: function () {
    this.remove();
  },

  afterRender: function () {},
  beforeRender: function () {},

  renderAt: function (template, data, el) {
    el.html(template(data));
  },

  /**
   * Takes an view or an array of views and
   * merges them into this view. For events,
   * it extends the individual events and does not clobber
   * them from the main view.
   */
  mixin: function (views) {
    var mainView = this;
    _.forEach([].concat(views), function (view) {
      var proto = view.prototype;
      for (var prop in proto) {
        if (prop === 'events')
          _.extend(mainView[prop], proto[prop]);
        else
          mainView[prop] = proto[prop];
      }
    });
  }
});
