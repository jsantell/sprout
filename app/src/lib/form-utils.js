/**
 * For use when converting strings from forms
 */

exports.validation = {
  number: function (s) {
    return s != +s ? 'Value must be a number.' : null;
  }
};
