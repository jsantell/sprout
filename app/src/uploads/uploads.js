var View = require('../views/view');
var Uploads = require('../models/uploads');
var Upload = require('../models/upload');
var UploadView =  require('./upload');
var events = require('../lib/events');

module.exports = View.extend({
  name: 'uploads',
  tagName: 'li',
  className: 'uploads dropdown',
  template: require('./uploads.hbs'),
  events: {
    'click a.processing': 'handleProcessingClick'
  },

  initialize: function () {
    this.models = new Uploads();
    this.badgeCount = 0;

    events.on('track:upload', this.uploadTrack, this);
    this.models.on('add', this.onAdd, this);
    this.models.on('change:status', this.onComplete, this);

    // Fired from header-controls
    this.on('open', this.clearBadge, this);
  },

  uploadTrack: function (params) {
    var upload = new Upload(params);
    var uploadView = new UploadView({ upload: upload });

    upload.uploadFile();
    
    // If this is the first upload, overwrite the default
    // placeholder <li>
    this.$('ul')[this.models.length ? 'prepend' : 'html'](uploadView.render().el);

    this.models.push(upload);
  },

  clearBadge: function () {
    this.badgeCount = 0;
    this.updateBadge();
  },

  onComplete: function () {
    // Don't update the badge if the view is already showing
    if (!this.$el.closest('.uploads').hasClass('open')) {
      this.badgeCount++;
      this.updateBadge();
    }
    this.updateProcessing();
  },

  onAdd: function () { this.updateProcessing(); },

  updateBadge: function () {
    this.$('.badge').text(this.badgeCount || '');
  },

  updateProcessing: function () {
    var processing = this.models.pending();

    var $processBadge = this.$('.processing-icon');
    if (processing.length)
      $processBadge.addClass('processing');
    else
      $processBadge.removeClass('processing');
  },

  destroy: function () {
    events.off('track:upload', this.uploadTrack, this);
    this.models.off('add', this.onAdd, this);
    this.models.off('change:status', this.onComplete, this);
    this.off('open', this.clearBadge, this);
  }

});
