var View = require('./view');

module.exports = View.extend({
  name: 'content',

  initialize: function (options) {
    this.template = options.template;
  }
});
