var animationEnd = [
  'webkitAnimationEnd',
  'mozAnimationEnd',
  'MSAnimationEnd',
  'oanimationend',
  'animationend'
].join(' ');

exports.animate  = function animate ($el, name) {
  $el.addClass('animated ' + name);
  $el.one(animationEnd, function () {
    $el.removeClass('animated ' + name);
  });
};

exports.remove = function remove ($el) {

}

/**
 * Flashes element `$el` as background color `color`, and
 * fades back to its original background color over `duration` seconds.
 *
 * TODO horribly hacky, need to find a nice performant solution
 */
exports.flash = function ($el, color, duration) {
  duration = duration == null ? 1 : duration;
  $el.css({ backgroundColor: color });
  setTimeout(function () {
    $el.css({ transition: 'background-color ' + duration + 's' })
      .css({ backgroundColor: '' });
  }, 1);
  setTimeout(function () {
    $el.css({ transition: '' });
  }, duration * 1000);
};
