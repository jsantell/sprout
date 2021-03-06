var Backbone = require('backbone');
var _ = require('underscore');

function initialize () {
  Backbone.history.loadUrl = _.wrap(
    Backbone.history.loadUrl, function (f) {
      var args = Array.prototype.slice.call(arguments, 1);
      var matched = f.apply(this, args);

      if (matched && window._gaq) {
        window._gaq.push([
          '_trackPageview',
          '/#' + this.fragment
        ]);
      }

      return matched;
    }
  );
}

module.exports = initialize;
