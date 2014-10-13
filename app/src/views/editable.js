var Backbone = require('backbone');
var View = require('./view');

module.exports = View.extend({
  events: {
    'click form.editable div.editable': 'handleEditableToggle',
    'blur form.editable input': 'handleEditableBlur'
  },

  handleEditableToggle: function (e) {
    var $container = getContainer(Backbone.$(e.target));
    if (isEditing($container))
      return;
    editOn($container);
  },

  handleEditableBlur: function (e) {
    var $container = getContainer(Backbone.$(e.target));
    if (!isEditing($container))
      return;
    editOff($container);
    if (this.onEdit)
      this.onEdit({
        property: $container.data('name'),
        value: $container.find('input').val()
      });
  }
});

function isEditing ($container) {
  return $container.hasClass('editable-editing');
}

function editOn ($container) {
  $container.addClass('editable-editing');
  $container.find('input').focus();
}

function editOff ($container) {
  $container.find('span').text($container.find('input').val());
  $container.removeClass('editable-editing');
}

function getContainer ($element) {
  return $element.is('div.editable') ?
    $element :
    $element.closest('.editable');
}
