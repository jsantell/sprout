var Backbone = require('backbone');
var _ = require('underscore');
var $ = Backbone.$;

var events = module.exports = _.extend({}, Backbone.Events);

// Also bind some global events so other objects can listen to without
// adding more DOM listeners
$(document).click(function (e) {
  events.trigger('document:click', e);
});
$(document).keyup(function (e) {
  if (e.keyCode === 27)
    events.trigger('document:esc', e);
});
