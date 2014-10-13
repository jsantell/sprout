var View = require('../views/view');

module.exports = View.extend({
  name: 'upload',
  tagName: 'li',
  className: 'upload',
  template: require('./upload.hbs'),
  events: {
    'click button.abort': 'abortUpload',
  },
  initialize: function (options) {
    this.model = options.upload;
    this.model.on('progress', this.onProgress, this);
    this.model.on('change', this.onChange, this);
    this.$el.addClass('status-pending');
  },

  onChange: function () {
    var uploadStatus = this.model.get('status');
    if (this.completed || !uploadStatus || uploadStatus === 'pending')
      return;

    this.completed = true;

    // Update title
    var title = this.model.get('displayTitle');
    if (title)
      this.$('.title').html(title);

    this.$el
      .removeClass('status-pending status-success status-failed status-aborted')
      .addClass('status-' + uploadStatus);

    var color = uploadStatus === 'success' ? 'success' :
                uploadStatus === 'failure' ? 'danger' :
                uploadStatus === 'aborted' ? 'warning' : 'info';

    // Update progress bar
    this.$('.progress').removeClass('progress-striped active')
      .find('.progress-bar').removeClass('progress-bar-primary').addClass('progress-bar-' + color)
        .css('width', '100%');
  },

  abortUpload: function (e) {
    e.preventDefault();
    this.model.abort();
  },

  onProgress: function (percent) {
    if (this.completed)
      return;
    this.$('.progress-bar').css('width', percent + '%');
  },

  destroy: function () {
    this.model.off('progress', this.onProgress, this);
    this.model.off('change', this.onChange, this);
  }

});
