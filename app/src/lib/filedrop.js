module.exports = function Filedropper (el, callback) {
  if (!(this instanceof Filedropper)) return new Filedropper(el, callback);
  el.ondragover = onDragOver.bind(this);
  el.ondragend = onDragEnd.bind(this);
  el.ondrop = onDrop.bind(this);
  this.$el = $(el);
  this.callback = callback;
};

function onDrop (e) {
  e.preventDefault();
  if (this.callback)
    this.callback(e.dataTransfer.files);
  this.$el.removeClass('hover');
}

function onDragOver (e) {
  this.$el.addClass('hover');
  e.preventDefault();
}

function onDragEnd (e) {
  this.$el.removeClass('hover');
  e.preventDefault();
}
