var Backbone = require('backbone');
var View = require('./view');
var modalTemplate = require('./modal-base.hbs');

module.exports = View.extend({
  events: {
    'click .close': 'handleClose',
    'click .modal-footer .btn': 'handleAction',
    'click .modal': 'handleCloseBackdrop'
  },

  /*
   * Override base template with a custom template,
   * that takes data, renders a modal view around the
   * child template and returns HTML
   */
  template: function (data) {
    return modalTemplate({
      title: this.modalTitle,
      body: this.bodyTemplate(data),
      actions: this.modalActions
    });
  },

  subrender: function () {

  },

  show: function () {
    Backbone.$('body').append(this.render().el);
    
    // Fire this on the next tick so we get the animated
    // fade
    setTimeout(function () {
      this.$('.modal-backdrop').addClass('in');
      this.$('.modal').addClass('in');
      this.$('.modal').attr('style', 'display:block;');
    }, 50);
  },

  handleAction: function (e) {
    e.preventDefault();
    var action = Backbone.$(e.target).data('action');
    if (this.onAction)
      this.onAction(action);
  },

  // Default case when clicking the backdrop, or the
  // 'x' close buttons
  handleClose: function (e) {
    this.destroy();
  },

  // Only destroy when the event target originated on the backdrop, not if it
  // originated within the modal itself
  handleCloseBackdrop: function (e) {
    var $target = $(e.target);
    if ($target.hasClass('modal'))
      this.destroy();
  }

});
