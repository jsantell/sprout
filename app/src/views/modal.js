var Backbone = require('backbone');
var defer = require('when').defer;
var View = require('./view');

module.exports = View.extend({
  name: 'modal',
  className: 'modal-view',
  template: require('./modal.hbs'),

  events: {
    'click .close': 'handleClose',
    'click .modal-footer .btn': 'handleAction',
    'click .modal': 'handleCloseBackdrop'
  },

  initialize: function (options) {
    this.title = options.title;
    this.content = options.content;
    this.actions = options.actions;
    Backbone.$('body').append(this.render().el);
    this.deferred = defer();
  },

  init: function () {
    // Fire this on the next tick so we get the animated
    // fade
    setTimeout(function () {
      this.$('.modal-backdrop').addClass('in');
      this.$('.modal').addClass('in');
      this.$('.modal').attr('style', 'display:block;')
    }, 50);
    return this.deferred.promise;
  },

  handleAction: function (e) {
    e.preventDefault();
    var $action = Backbone.$(e.target);
    this.deferred.resolve($action.data('action'));
  },

  // Default case when clicking the backdrop, or the
  // 'x' close buttons

  handleClose: function (e) {
    this.deferred.resolve('close');
    this.destroy();
  },
  
  // Only destroy when the event target originated on the backdrop, not if it
  // originated within the modal itself
  handleCloseBackdrop: function (e) {
    var $target = $(e.target);
    if ($target.hasClass('modal')) {
      this.deferred.resolve('close');
      this.destroy();
    }
  },

  getRenderData: function () {
    return {
      title: this.title,
      actions: this.actions
    };
  },

  afterRender: function () {
    // Inject outside of the template so we can take strings or DOM elements
    this.$('.modal-body').html(this.content);
  }

});
