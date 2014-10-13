var when = require('when');
var _ = require('underscore');

function trim (array) {
  return _.map(array, function (s) { return s.trim(); });
}

function stringToArrayCast (s) {
  return typeof s === 'string' ? trim((s || '').split(',')) : s;
}
exports.stringToArrayCast = stringToArrayCast;

function arrayToStringCast (a) {
  return a.join(', ');
}
exports.arrayToStringCast = arrayToStringCast;

/**
 * Casts to number
 *
 * @param {String} str
 * @return {Number}
 */

function numberCast (str) {
  return ~~str;
}
exports.numberCast = numberCast;

/**
 * Arrayify `arguments`
 *
 * @param {Argument} args
 * @return {Array}
 */

function arrayify (args) {
  return Array.prototype.slice.call(args, 0);
}
exports.arrayify = arrayify;
